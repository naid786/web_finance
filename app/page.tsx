"use client";

import { Card } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
// ...existing code...
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  pdf: z.custom<File>((v) => v instanceof File && v.type === "application/pdf", {
    message: "Only PDF files are allowed",
  }),
  bank: z.string(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bank: "" },
  });

  const onSubmit = (data: FormValues) => {
    // prevent default form submission
    // No action needed: react-hook-form's handleSubmit already prevents default submission

    // want to extract the transactions from the pdf and convert to excel
    const { pdf } = data;

    void (async () => {
      try {
        // Create FormData object for API endpoint
        const formData = new FormData();
        formData.append("pdf", pdf);

        const response = await fetch("/api/convert-pdf-to-excel", {
          method: "POST",
          body: formData,
        });

        if (!response.ok) {
          const error = await response.json();
          throw new Error(error.message || 'Conversion failed');
        }

        const blob = await response.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = 'transactions.xlsx';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        window.URL.revokeObjectURL(link.href);
      } catch (err) {
        console.error(err);
        alert(err instanceof Error ? err.message : 'Unknown error occurred');
        alert("Unable to extract transactions. Please try again.");
      }
    })();
  };

  return (
    <Card className="container mx-auto p-4 w-full ">
      <h1 className="text-2xl font-bold mb-4">PDF to Excel Converter</h1>
      <Form {...form}  >
        <form  className="space-y-4 w-full " onSubmit={form.handleSubmit(onSubmit)}>
          <FormField
            control={form.control}
            name="pdf"
            render={({ field }) => (

              <FormItem>
                <FormLabel>PDF File</FormLabel>
                <FormControl>
                  <div className="flex">
                    <Input
                      type="file"
                      accept="application/pdf,.pdf"
                      className="mt-2 w-full "
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


