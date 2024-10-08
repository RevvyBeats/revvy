import { Params, useNavigate, useParams } from "@/router";
import { useCallback, useMemo } from "react";
import { useSearchParams } from "react-router-dom";
import { z } from "zod";

// Define types
type FilterState = Record<string, string[] | string>;

type SortItem = {
  value: string;
  label: string;
};
type Option = {
  label: string;
  value: string;
  icon?: React.ComponentType<{ className?: string }>;
};

type FilterOption = {
  id: string;
  label: string;
  values?: string[];
  options: Option[];
  isMulti?: boolean;
	onBarView?:boolean;
  enabled?: boolean;

};
// Create schemas dynamically
const createFilterSchema = (options: FilterOption[]) => {
  const schemaShape: Record<string, z.ZodTypeAny> = {};
  options.forEach(option => {
    if (option.enabled === false) {
      return;
    }
    schemaShape[option.id] =
      option.isMulti === true
        ? z.array(z.string()).optional()
        : z.string().optional();
  });
  return z.object(schemaShape);
};

const createSortSchema = (sort_items: SortItem[]) => {
  if (sort_items.length === 0)
    throw new Error("sort_items must have at least one item.");
  const sortValues = sort_items.map(item => item.value) as [
    string,
    ...string[],
  ];
  return z.object({
    order_by: z.enum(sortValues).default(sortValues[0]),
    order: z.enum(["asc", "desc"]).default("desc"),
  });
};
function removeEmptyParams(params: Record<string, any>) {
  return Object.entries(params).reduce(function (acc, [key, val]) {
    if (val.length > 0) {
      acc[key] = val;
    }
    return acc;
  }, {});
}
const paginationSchema = z.object({
  per_page: z.enum(["30", "60", "90"]).default("30"),
});
const searchSchema = z.object({ keyword: z.string().optional() });

// Utility functions
const serializeQuery = (items: FilterState): Record<string, string> => {
  return Object.fromEntries(
    Object.entries(items).map(([key, values]) => [
      key,
      Array.isArray(values) ? (values as string[]).sort().join(",") : values,
    ]),
  );
};
type ParamsWith<T, Keys extends string[] = ["type"]> = {
  [K in keyof T]: Keys extends (keyof T[K])[] ? K : never;
}[keyof T];
type useCollectionProps = {
  options: FilterOption[];
  path: ParamsWith<Params, ["type"]>; // Only need Params that has `type` params
  sort: SortItem[];
};
export default function useCollection({
  options,
  path,
  sort,
}: useCollectionProps) {
  const [searchParams, setSearchParams] = useSearchParams();
  const filterSchema = useMemo(() => createFilterSchema(options), [options]);
  const sortSchema = useMemo(() => createSortSchema(sort), [sort]);
  const params = useParams(path);
  const navigate = useNavigate();
  const unserializeQuery = useCallback(
    (searchParams: URLSearchParams): FilterState => {
      const result = {};
      Array.from(searchParams.entries()).forEach(([key, value]) => {
        const option = options.find(i => i.id === key);
        if (option) {
          result[key] = option.isMulti
            ? value.split(",").filter(v => v.length > 0)
            : value;
        }
      });
      return result as FilterState;
    },
    [options],
  );
  // Extract and validate initial state from search params
  const initialState = useMemo(() => {
    const unserialized = unserializeQuery(searchParams);
    const filterResult = filterSchema.safeParse(unserialized);
    const sortResult = sortSchema.safeParse(Object.fromEntries(searchParams));

    const searchResult = searchSchema.safeParse(
      Object.fromEntries(searchParams),
    );
    const paginationResult = paginationSchema.safeParse(
      Object.fromEntries(searchParams),
    );
    return {
      items: filterResult.success ? filterResult.data : {},
      sorting: sortResult.success ? sortResult.data : {},
      search: searchResult.success ? searchResult.data : {},
      pagination: paginationResult.success ? paginationResult.data : {},
    };
  }, [searchParams, filterSchema, sortSchema, searchSchema, paginationSchema]);
  // Update URL with new filter and sorting parameters

  function setFilter(key: string, values: string[]) {
    const newItems = removeEmptyParams({
      ...initialState.items,
      [key]: values.length > 0 && values.sort(),
    });
    resetPage();
    setSearchParams({
      ...initialState.search,
      ...serializeQuery(newItems),
      ...initialState.sorting,
      ...initialState.pagination,
    });
  }

  function setSort(key: string, order: "asc" | "desc") {
    const newSorting = removeEmptyParams({
      order_by: key ?? null,
      order: order ?? "asc",
    });
    setSearchParams({
      ...initialState.search,
      ...serializeQuery(initialState.items),
      ...newSorting,
      ...initialState.pagination,
    });
  }
  function setSearch(keyword: string) {
    resetPage();
    setSearchParams({
      ...(keyword.length > 0 ? { keyword } : {}),
      ...serializeQuery(initialState.items),
      ...initialState.sorting,
      ...initialState.pagination,
    });
  }
  function setPerPage(per_page: number | string) {
    resetPage();
    setSearchParams({
      ...initialState.search,
      ...serializeQuery(initialState.items),
      ...initialState.sorting,
      per_page: String(per_page),
    });
  }
  function clearFilter() {
    resetPage();
    setSearchParams({
      ...initialState.sorting,
      ...initialState.pagination,
    });
  }
  function resetPage() {
    navigate(path, { params: { type: params.type } });
  }

  return {
    options,
    searchParams,
    sort,
    search: initialState.search,
    items: initialState.items,
    sorting: initialState.sorting,
    pagination: initialState.pagination,
    setFilter,
    setSort,
    resetPage,
    setSearch,
    setPerPage,
    clearFilter,
  };
}
