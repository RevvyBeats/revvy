import { Card, CardContent, CardHeader } from "@/components/ui/card";
import useApiFetch from "@/hooks/useApiFetch";
import { cn } from "@/lib/utils";
import { PostItemCollectionResponse } from "@/types/item";
import version_compare from "@/utils/version_compare";
import { __ } from "@wordpress/i18n";
import { useMemo } from "react";
import { ClassNameValue } from "tailwind-merge";
import { StackedBarChart, StackedBarChartDataType } from "./StackedBarChart";

type Props = {
  className?: ClassNameValue;
};

export default function InstallStats({ className }: Props) {
  const { data, isLoading, isError, status } =
    useApiFetch<PostItemCollectionResponse>(`update/list`, {});
  const themes = useMemo(() => {
    if (data?.data) {
      return data?.data?.filter(item => item.type === "wordpress-themes");
    }
    return [];
  }, [data]);
  const plugins = useMemo(() => {
    if (data?.data) {
      return data?.data?.filter(item => item.type === "wordpress-plugins");
    }
    return [];
  }, [data]);
  const chartData = useMemo<StackedBarChartDataType[]>(
    () => [
      {
        name: "theme",
        label: __("Themes", 'festingervault'),
        value: themes?.length,
        color: "hsl(var(--chart-1))",
      },
      {
        name: "plugin",
        label: __("Plugins", 'festingervault'),
        value: plugins?.length,
        color: "hsl(var(--chart-2))",
      },
    ],
    [plugins, themes],
  );
  const total = plugins.length + themes.length;
  return (
    <Card className={cn("aspect-auto justify-between ", className)}>
      <CardHeader className="border-b border-border">
        <h3 className="text-lg">{__("Installed Assets", 'festingervault')}</h3>
      </CardHeader>
      <CardContent className="flex flex-col gap-4">
        <div className="text-muted-foreground">{__("Installed", 'festingervault')}</div>
        <div className="space-x-2">
          <span className="text-3xl">{total}</span>
          <span className="text-muted-foreground">{__("Items", 'festingervault')}</span>
        </div>
        <StackedBarChart data={chartData} />
      </CardContent>
    </Card>
  );
}
