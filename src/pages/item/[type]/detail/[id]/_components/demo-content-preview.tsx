import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import useApiFetch from "@/hooks/useApiFetch";
import { Link, useParams } from "@/router";
import { DemoContentCollectionResponse, PostItemType } from "@/types/item";
import { DemoContentTable } from "./item-demo-contents";
import { __ } from "@wordpress/i18n";

type Props = {
  item: PostItemType;
};

export default function DemoContentPreview({ item }: Props) {
  const params = useParams("/item/:type/detail/:id/:tab?");
  const { data, isLoading, isFetching } =
    useApiFetch<DemoContentCollectionResponse>("item/demo-content", {
      item_id: params.id,
    });
  return (
    <div className="flex flex-col gap-5 sm:gap-7">
      <Card>
        <CardHeader className="border-b p-5 sm:p-7">{__("Demo Contents", 'festingervault')}</CardHeader>
        <CardContent className="p-5 text-sm sm:p-7">
          {data?.data ? (
            <div className="flex flex-col gap-4">
              <DemoContentTable item={item} data={data?.data.slice(0, 5)} />
            </div>
          ) : isLoading || isFetching ? (
            <div className="">{__("Loading...", 'festingervault')}</div>
          ) : (
            <div className="">{__("No Items Found", 'festingervault')}</div>
          )}
        </CardContent>
        <CardFooter className="justify-center border-t border-border text-center">
          <Link
            to="/item/:type/detail/:id/:tab?"
            params={{ ...params, tab: "demo-contents" }}
            className="border-b border-dashed border-blue-500 text-sm text-blue-500"
          >
            {__("View More", 'festingervault')}
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}
