"use client";

import { Card } from "@/components/ui/card";
import Image from "next/image";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { DropdownMenu, DropdownMenuCheckboxItem, DropdownMenuContent, DropdownMenuLabel, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { convertPdfToExcelAction, extractTransactionsFromPdfText } from "../actions/convert_pdf_to_excel";

const formSchema = z.object({
  pdf: z.custom<File>((v) => v instanceof File && v.type === "application/pdf", {
    message: "Only PDF files are allowed",
  }),
  bank: z.string(),
});

type FormData = z.input<typeof formSchema>;

export default function Home() {

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: { bank: "" },
  });

  const onSubmit = (data: FormData) => {
    // want to extract the transactions from the pdf and convert to excel
    const { pdf } = data;

    void (async () => {
      try {
        const result = await convertPdfToExcelAction(pdf);
        // if success, download the file
        if (result.success && result.downloadUrl) {
          const link = document.createElement('a');
          link.href = result.downloadUrl;
          link.download = 'transactions.xlsx';
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
        } else {
          throw new Error(result.message || 'Conversion failed');
        }
        console.log(result);
      } catch (err) {
        console.error(err);
        alert("Unable to extract transactions. Please try again.");
      }
    })();
  };

  return (
    <Card className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">PDF to Excel Converter</h1>
      <Form {...form} >
        <form  className="space-y-4 " onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (

              <FormItem>
                <FormLabel>PDF File</FormLabel>
                <FormControl>
                  <div className="flex w-md">
                    <Input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="mt-2  "
                      name={field.name}
                      ref={field.ref}
                      onBlur={field.onBlur}
                      onClick={(e) => ((e.target as HTMLInputElement).value = "")}
                      onChange={(e) => field.onChange(e.currentTarget.files?.[0])}
                    /> 
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* <FormField
            control={form.control}
            name="bank"
            render={({ field }) => (
              <FormItem >
                <FormLabel>Bank</FormLabel>
                <FormControl>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <div>
                        <Button type="button" variant="outline" >
                          Select Bank
                        </Button>
                      </div>  
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-64">
                      <DropdownMenuCheckboxItem>Option 1</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Option 2</DropdownMenuCheckboxItem>
                      <DropdownMenuCheckboxItem>Option 3</DropdownMenuCheckboxItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          /> */}
          <Button type="submit">Submit</Button>
        </form>


      </Form>

    </Card>
  );
}
