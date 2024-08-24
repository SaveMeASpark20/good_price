"use client";
import { debounce } from "@/lib/debounce";
import { Product } from "@/types";
import { useRouter } from "next/navigation";
import React, { ChangeEvent, useCallback, useEffect, useState } from "react";

type SearchBarParams = {
  search?: string;
};

const FilterSearchbar = ({ search }: SearchBarParams) => {
  const [textInput, setTextInput] = useState(search);
  const router = useRouter();
  //debounce -> call the debounce -> function to add queryParams

  const useDebounce = useCallback(
    debounce((value: string) => {
      router.push(`?search=${value}`, { scroll: false });
    }),
    [textInput]
  );

  useEffect(() => {
    useDebounce(textInput!);
  }, [textInput]);

  const handleTextInput = (event: ChangeEvent<HTMLInputElement>) => {
    setTextInput(event.target.value);
  };
  console.log(textInput);

  return (
    <>
      <input
        className="searchbar-input"
        placeholder="Search Here"
        value={textInput}
        onChange={handleTextInput}
      />
    </>
  );
};

export default FilterSearchbar;
