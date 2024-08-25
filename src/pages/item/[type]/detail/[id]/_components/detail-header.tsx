import { Grid } from "@/components/ui/grid";
import { Skeleton } from "@/components/ui/skeleton";
import { PostItemType } from "@/types/item";
import capitalizeHyphenatedWords from "@/utils/capitalizeHyphenatedWords";
import { decodeEntities } from "@wordpress/html-entities";
import { __ } from "@wordpress/i18n";
import { Calendar, CheckCircle2 } from "lucide-react";
import moment from "moment";
export function ItemDetailHeaderSkeleton() {
  return (
    <div className="relative flex flex-col items-center gap-3 p-6 py-12">
      <Grid size={50} />
      <div>
        <Skeleton className="aspect-video h-52 rounded-md" />
      </div>
      <Skeleton className="h-5 w-52" />
    </div>
  );
}
type Props = {
  item: PostItemType;
};
export default function ItemDetailHeader({ item }: Props) {
	const category=item.terms?.filter(term=>term.taxonomy==="category").map(term=>decodeEntities(term.name));
  return (
    <div className="relative flex flex-col items-center gap-3 p-6 py-12">
      <Grid size={50} />
      <div>
        <img src={item.image} className="aspect-video h-52 rounded-md" />
      </div>
      <h1 className="text-xl">{decodeEntities(item.title)}</h1>
      <div className="flex flex-row gap-5 text-sm text-muted-foreground">
        <div className="space-x-2">
          <span>In</span>
          <span>{category.join(", ")}</span>
        </div>
        <div className="flex flex-row items-center gap-1 text-green-600">
          {moment.unix(item.updated).isBefore(moment().add(1, "week")) ? (
            <>
              <CheckCircle2 size={18} /> <span>{__("Recently Updated", 'festingervault')}</span>
            </>
          ) : (
            <>
              <Calendar size={18} />
              <span>{moment.unix(item.updated).fromNow()}</span>
            </>
          )}
        </div>
        {item.additional_content_count > 0 && (
          <div className="flex flex-row items-center gap-1 text-green-600">
            <CheckCircle2 size={18} />
            <span>{__("Demo Included", 'festingervault')}</span>
          </div>
        )}
      </div>
    </div>
  );
}
