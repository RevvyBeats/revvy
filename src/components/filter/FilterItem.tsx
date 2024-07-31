import { CheckIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
	CommandSeparator,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import useFilter, { FilterOption } from "@/hooks/useFilter";
import { cn } from "@/lib/utils";
import { PlusCircledIcon } from "@radix-ui/react-icons";
import { __ } from "@wordpress/i18n";
import { Badge } from "../ui/badge";
import { Separator } from "../ui/separator";
export type FilterItemProps = {
	filter: ReturnType<typeof useFilter>;
	item: FilterOption;
};
export default function FilterItem({ item, filter }: FilterItemProps) {
	const selectedValues = new Set<string>(
		item.isMulti
			? filter.items[item.id]
			: filter.items[item.id]
				? [filter.items[item.id]]
				: null,
	);
	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button variant="outline" size="sm" className="h-9 border-dashed">
					<PlusCircledIcon className="mr-2 h-4 w-4" />
					{item.label}
					{selectedValues?.size > 0 && (
						<>
							<Separator orientation="vertical" className="mx-2 h-4" />
							<Badge
								variant="secondary"
								className="rounded-sm px-1 font-normal lg:hidden"
							>
								{selectedValues.size}
							</Badge>
							<div className="hidden space-x-1 lg:flex">
								{selectedValues.size > 2 ? (
									<Badge
										variant="secondary"
										className="rounded-sm px-1 font-normal"
									>
										{selectedValues.size} selected
									</Badge>
								) : (
									item.options
										.filter(option => selectedValues.has(option.value))
										.map(option => (
											<Badge
												variant="secondary"
												key={option.value}
												className="rounded-sm px-1 font-normal"
											>
												{option.label}
											</Badge>
										))
								)}
							</div>
						</>
					)}
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[200px] p-0" align="start">
				<Command>
					{item.options.length > 10 && (
						<CommandInput placeholder={__("Search")} />
					)}
					<CommandList>
						<CommandEmpty>{__("No results found.")}</CommandEmpty>
						<CommandGroup>
							{item.options.map(option => {
								const isSelected = selectedValues.has(option.value);
								return (
									<CommandItem
										key={option.value}
										onSelect={newValue => {
											if (isSelected) {
												selectedValues.delete(option.value);
											} else {
												if (item.isMulti === false) {
													selectedValues.clear();
												}
												selectedValues.add(option.value);
											}
											const filterValues = Array.from(selectedValues);

											filter.setFilter(item.id, filterValues);
										}}
									>
										<div
											className={cn(
												"mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
												isSelected
													? "bg-primary text-primary-foreground"
													: "opacity-50 [&_svg]:invisible",
											)}
										>
											<CheckIcon className={cn("h-4 w-4")} />
										</div>
										{option.icon && (
											<option.icon className="mr-2 h-4 w-4 text-muted-foreground" />
										)}
										<span>{option.label}</span>
									</CommandItem>
								);
							})}
						</CommandGroup>
						{selectedValues.size > 0 && (
							<>
								<CommandSeparator />
								<CommandGroup>
									<CommandItem
										onSelect={() => filter.setFilter(item.id, [])}
										className="justify-center text-center"
									>
										{__("Clear Filter")}
									</CommandItem>
								</CommandGroup>
							</>
						)}
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
