
"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";


type ComboboxOption = {
  value: string;
  label: string;
};


type ComboboxProps = {
  options?: ComboboxOption[];

  value?: string;

  onChange?: (
    value: string,
    fullObject?: ComboboxOption
  ) => void;

  placeholder?: string;

  defaultValue?: string;

  width?: string;
};


export function Combobox({
  options = [],
  value: controlledValue,
  onChange,
  placeholder = "Select...",
  defaultValue = "",
  width = "w-full",

}: ComboboxProps) {

  const [open, setOpen] = React.useState<boolean>(false);

  const [internalValue, setInternalValue] =
    React.useState<string>(defaultValue);


  // Controlled vs Uncontrolled
  const value =
    controlledValue !== undefined
      ? controlledValue
      : internalValue;


  const selectedItem = options.find(
    (item) => item.value === value
  );


  const handleSelect = (currentValue: string) => {

    const newValue =
      currentValue === value
        ? ""
        : currentValue;


    // Uncontrolled mode
    if (controlledValue === undefined) {
      setInternalValue(newValue);
    }


    const fullObject = options.find(
      (item) => item.value === newValue
    );


    onChange?.(newValue, fullObject);


    setOpen(false);
  };


  return (

    <Popover
      open={open}
      onOpenChange={setOpen}
    >

      <PopoverTrigger render={<Button
        variant="outline"
        role="combobox"
        aria-expanded={open}
        className={cn(
          width,
          "justify-between"
        )}
      >

        {selectedItem
          ? selectedItem.label
          : placeholder
        }

        <ChevronsUpDown className="opacity-50" />

      </Button>}>



      </PopoverTrigger>


      <PopoverContent
        className={cn(
          width,
          "p-0"
        )}
      >

        <Command className="w-80 lg:w-125">

          <CommandInput
            placeholder="search..."
            className="h-9"
          />

          <CommandList>

            <CommandEmpty>
              No result found.
            </CommandEmpty>


            <CommandGroup>

              {options.map((item) => (

                <CommandItem
                  key={item.value}

                  // This is used for searching
                  value={item.label}

                  onSelect={() =>
                    handleSelect(item.value)
                  }
                >

                  {item.label}


                  <Check
                    className={cn(
                      "ml-auto",

                      value === item.value
                        ? "opacity-100"
                        : "opacity-0"
                    )}
                  />

                </CommandItem>

              ))}

            </CommandGroup>

          </CommandList>

        </Command>

      </PopoverContent>

    </Popover>

  );
}

