"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { ThemeToggle } from "@/components/theme-toggle";
import { FileText, Download, Upload, CheckCircle2, AlertCircle, ArrowRight, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

const formSchema = z.object({
  pdf: z.custom<File>((v) => v instanceof File && v.type === "application/pdf", {
    message: "Only PDF files are allowed",
  }),
  bank: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

export default function Home() {
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [processingStep, setProcessingStep] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { bank: "" },
  });

  const simulateProgress = () => {
    setProgress(0);
    const steps = [
      { progress: 20, message: "Validating PDF file..." },
      { progress: 40, message: "Extracting text content..." },
      { progress: 60, message: "Parsing transactions..." },
      { progress: 80, message: "Generating Excel file..." },
      { progress: 100, message: "Processing complete!" },
    ];

    steps.forEach((step, index) => {
      setTimeout(() => {
        setProgress(step.progress);
        setProcessingStep(step.message);
      }, index * 800);
    });
  };

  const onSubmit = (data: FormValues) => {
    const { pdf } = data;
    setIsProcessing(true);
    simulateProgress();

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
        
        toast.success("File converted successfully!", {
          description: "Your Excel file has been downloaded.",
        });
      } catch (err) {
        console.error(err);
        toast.error("Conversion failed", {
          description: err instanceof Error ? err.message : 'Unknown error occurred',
        });
      } finally {
        setIsProcessing(false);
        setProgress(0);
        setProcessingStep("");
      }
    })();
  };

  const clearForm = () => {
    form.reset();
    setUploadedFile(null);
    setProgress(0);
    setProcessingStep("");
    setIsProcessing(false);
    
    // Clear the actual file input element
    const fileInput = document.getElementById('pdf-upload') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
    
    toast.info("Form cleared", {
      description: "You can upload a new PDF file.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 p-3 sm:p-4 md:p-6">
      <div className="container mx-auto max-w-full xl:max-w-7xl px-2 sm:px-4 lg:px-6">
        {/* Theme Toggle - Top Right */}
        <div className="flex justify-end mb-4 sm:mb-6">
          <ThemeToggle />
        </div>
        {/* Header Section */}
        <div className="text-center mb-6 sm:mb-8 pt-4 sm:pt-8">
          <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 bg-primary/10 rounded-full mb-4">
            <FileText className="h-4 w-4 sm:h-5 sm:w-5 text-primary" />
            <Badge variant="secondary" className="text-primary text-xs sm:text-sm">
              PDF to Excel Converter
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 px-2">
            Transform Your Financial Documents
          </h1>
          <p className="text-base sm:text-lg text-muted-foreground max-w-2xl mx-auto px-4">
            Convert your bank statements and financial PDFs to Excel spreadsheets with ease. 
            Extract transactions, organize data, and analyze your finances efficiently.
          </p>
        </div>

        {/* Features Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-6 mb-6 sm:mb-8 px-2 sm:px-0">
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-green-500/10 rounded-lg flex-shrink-0">
                  <Upload className="h-4 w-4 sm:h-5 sm:w-5 text-green-600 dark:text-green-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Easy Upload</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Drag & drop your PDF files</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/10 rounded-lg flex-shrink-0">
                  <CheckCircle2 className="h-4 w-4 sm:h-5 sm:w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Secure Processing</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Files not stored on servers</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="border-border shadow-sm hover:shadow-md transition-shadow">
            <CardContent className="pt-4 sm:pt-6 p-4 sm:p-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-purple-500/10 rounded-lg flex-shrink-0">
                  <Download className="h-4 w-4 sm:h-5 sm:w-5 text-purple-600 dark:text-purple-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-semibold text-foreground text-sm sm:text-base">Instant Download</h3>
                  <p className="text-xs sm:text-sm text-muted-foreground">Get Excel files immediately</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Converter Card */}
        <Card className="border-border shadow-lg mx-2 sm:mx-0">
          <CardHeader className="text-center pb-4 sm:pb-6 px-4 sm:px-6">
            <CardTitle className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
              Convert PDF to Excel
            </CardTitle>
            <CardDescription className="text-muted-foreground text-sm sm:text-base">
              Upload your PDF files and convert them to structured Excel spreadsheets
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <FormField
                  control={form.control}
                  name="pdf"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="text-foreground font-medium text-sm sm:text-base">
                        Select PDF File
                      </FormLabel>
                      <FormControl>
                        <div>
                          <Input
                            type="file"
                            accept="application/pdf,.pdf"
                            className="sr-only"
                            id="pdf-upload"
                            name={field.name}
                            ref={field.ref}
                            onBlur={field.onBlur}
                            onChange={(e) => {
                              const file = e.currentTarget.files?.[0];
                              field.onChange(file);
                              setUploadedFile(file || null);
                            }}
                          />
                          <label
                            htmlFor="pdf-upload"
                            className="cursor-pointer block border-2 border-dashed border-border rounded-lg p-4 sm:p-6 md:p-8 text-center hover:border-muted-foreground/50 transition-colors"
                          >
                            <div className="space-y-3 sm:space-y-4">
                              <div className="mx-auto w-10 h-10 sm:w-12 sm:h-12 bg-muted rounded-lg flex items-center justify-center">
                                <FileText className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <div className="flex flex-col sm:inline-flex sm:flex-row items-center gap-1 sm:gap-2 text-muted-foreground hover:text-foreground transition-colors">
                                  <span className="font-medium text-sm sm:text-base">Click to upload</span>
                                  <span className="text-muted-foreground text-xs sm:text-sm">or drag and drop</span>
                                </div>
                                <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                                  PDF files only, up to 10MB
                                </p>
                              </div>
                              
                              {uploadedFile && (
                                <div className="inline-flex items-center gap-2 px-3 py-2 bg-green-500/10 text-green-700 dark:text-green-400 rounded-lg border border-green-200 dark:border-green-800 max-w-full">
                                  <CheckCircle2 className="h-4 w-4 flex-shrink-0" />
                                  <span className="text-xs sm:text-sm font-medium truncate">{uploadedFile.name}</span>
                                </div>
                              )}
                            </div>
                          </label>
                        </div>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Processing Progress */}
                {isProcessing && (
                  <div className="space-y-3 sm:space-y-4">
                    <Separator />
                    <Alert className="p-3 sm:p-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription className="text-xs sm:text-sm ml-2">
                        {processingStep || "Processing your file..."}
                      </AlertDescription>
                    </Alert>
                    <Progress value={progress} className="w-full h-2" />
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3">
                  <Button 
                    type="submit" 
                    className="flex-1 h-10 sm:h-12 text-sm sm:text-base font-medium bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 transition-all duration-200"
                    disabled={isProcessing || !uploadedFile}
                  >
                    {isProcessing ? (
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 sm:w-4 sm:h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        <span className="hidden sm:inline">Processing...</span>
                        <span className="sm:hidden">Processing</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="hidden sm:inline">Convert to Excel</span>
                        <span className="sm:hidden">Convert</span>
                        <ArrowRight className="h-3 w-3 sm:h-4 sm:w-4" />
                      </div>
                    )}
                  </Button>
                  
                  <Button 
                    type="button"
                    variant="outline"
                    className="h-10 sm:h-12 px-4 sm:px-6 text-sm sm:text-base"
                    onClick={clearForm}
                    disabled={isProcessing || !uploadedFile}
                  >
                    <RotateCcw className="h-3 w-3 sm:h-4 sm:w-4 mr-2" />
                    Clear
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>

        {/* Footer */}
        <div className="text-center mt-6 sm:mt-8 text-xs sm:text-sm text-muted-foreground px-4">
          <p>Secure processing • Your files are not stored on our servers</p>
        </div>
      </div>
    </div>
  );
}


