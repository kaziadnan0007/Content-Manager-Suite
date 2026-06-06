import { AdminLayout } from "@/components/layout/admin-layout";
import { useListProducts, useCreateProduct, useUpdateProduct, useDeleteProduct, useListCategories, useUploadFile, getListProductsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { useState, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, Image as ImageIcon, Upload, Download, CheckCircle2, AlertCircle, FileSpreadsheet, FileDown } from "lucide-react";
import * as XLSX from "xlsx";

interface ImportResult {
  imported: number;
  errors: number;
  total: number;
  errorDetails: { row: number; error: string }[];
}

function CsvImportDialog({ onDone }: { onDone: () => void }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<"upload" | "preview" | "result">("upload");
  const [csvData, setCsvData] = useState<string>("");
  const [previewRows, setPreviewRows] = useState<Record<string, string>[]>([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  const SAMPLE_CSV = `name,description,price,compare_price,category,stock,featured,badge,images
Samsung Galaxy A54,Latest Samsung smartphone with 6.4 inch display,25000,30000,Electronics,50,false,New,https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600
Nike Air Max 270,Comfortable running shoes with air cushion,5500,7000,Shoes,100,true,Best Seller,https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600
Organic Basmati Rice 5kg,Premium quality basmati rice from Bangladesh,450,500,Grocery,200,false,,
`;

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "product-import-sample.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleFile = (file: File) => {
    setError("");
    const ext = file.name.split(".").pop()?.toLowerCase();

    if (ext === "csv" || ext === "txt") {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target?.result as string;
        processCsv(text);
      };
      reader.readAsText(file);
    } else if (ext === "xlsx" || ext === "xls") {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = new Uint8Array(e.target?.result as ArrayBuffer);
          const workbook = XLSX.read(data, { type: "array" });
          const sheet = workbook.Sheets[workbook.SheetNames[0]];
          const csv = XLSX.utils.sheet_to_csv(sheet);
          processCsv(csv);
        } catch {
          setError("Excel file could not be read. Please try CSV format.");
        }
      };
      reader.readAsArrayBuffer(file);
    } else {
      setError("Please upload a CSV (.csv) or Excel (.xlsx, .xls) file.");
    }
  };

  const processCsv = (text: string) => {
    setCsvData(text);
    const lines = text.trim().split("\n");
    if (lines.length < 2) {
      setError("File must have a header row and at least one data row.");
      return;
    }
    const headers = lines[0].split(",").map((h) => h.trim().replace(/^"|"$/g, ""));
    const rows = lines.slice(1, 6).map((line) => {
      const values = line.split(",").map((v) => v.trim().replace(/^"|"$/g, ""));
      return Object.fromEntries(headers.map((h, i) => [h, values[i] ?? ""]));
    });
    setPreviewRows(rows);
    setStep("preview");
  };

  const handleImport = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/products/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ csvData }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error ?? "Import failed");
      } else {
        setResult(json as ImportResult);
        setStep("result");
        onDone();
      }
    } catch {
      setError("Network error during import.");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setStep("upload");
    setCsvData("");
    setPreviewRows([]);
    setResult(null);
    setError("");
    if (fileRef.current) fileRef.current.value = "";
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setOpen(v); if (!v) reset(); }}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <FileSpreadsheet className="w-4 h-4" />
          Import CSV/Excel
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="w-5 h-5" /> Bulk Import Products
          </DialogTitle>
        </DialogHeader>

        {step === "upload" && (
          <div className="space-y-4">
            <div className="bg-muted/50 rounded-lg p-4 text-sm space-y-2">
              <p className="font-semibold">CSV/Excel কলামগুলো:</p>
              <div className="grid grid-cols-3 gap-1 text-xs font-mono text-muted-foreground">
                {["name*", "description", "price*", "compare_price", "category", "stock", "featured", "badge", "images"].map(col => (
                  <span key={col} className={`px-2 py-0.5 rounded ${col.endsWith("*") ? "bg-primary/20 text-primary font-bold" : "bg-muted"}`}>{col}</span>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">* required  |  images: URL গুলো | দিয়ে আলাদা করুন  |  category: নাম বা id</p>
            </div>

            <Button variant="outline" size="sm" className="gap-2 w-full" onClick={downloadSample}>
              <Download className="w-4 h-4" /> Sample CSV Download করুন
            </Button>

            <div
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/30 transition-colors relative"
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) handleFile(f); }}
            >
              <FileSpreadsheet className="w-10 h-10 mx-auto mb-2 text-muted-foreground" />
              <p className="font-medium">CSV বা Excel ফাইল এখানে Drag & Drop করুন</p>
              <p className="text-sm text-muted-foreground mt-1">অথবা নিচের বোতামে ক্লিক করুন</p>
              <input
                ref={fileRef}
                type="file"
                accept=".csv,.xlsx,.xls,.txt"
                className="absolute inset-0 opacity-0 cursor-pointer"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) handleFile(f); }}
              />
            </div>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded p-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}
          </div>
        )}

        {step === "preview" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted/50 rounded p-3">
              <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
              ফাইল লোড হয়েছে। প্রথম ৫টি row এর preview:
            </div>

            <div className="overflow-x-auto border rounded-lg">
              <Table>
                <TableHeader>
                  <TableRow>
                    {previewRows[0] && Object.keys(previewRows[0]).slice(0, 6).map(h => (
                      <TableHead key={h} className="text-xs">{h}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {previewRows.map((row, i) => (
                    <TableRow key={i}>
                      {Object.values(row).slice(0, 6).map((val, j) => (
                        <TableCell key={j} className="text-xs max-w-[120px] truncate">{val || "—"}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <p className="text-sm text-muted-foreground">
              মোট {csvData.trim().split("\n").length - 1}টি product import হবে।
            </p>

            {error && (
              <div className="flex items-center gap-2 text-destructive text-sm bg-destructive/10 rounded p-3">
                <AlertCircle className="w-4 h-4 shrink-0" /> {error}
              </div>
            )}

            <div className="flex gap-3">
              <Button variant="outline" onClick={reset} className="flex-1">আবার বেছে নিন</Button>
              <Button onClick={handleImport} disabled={loading} className="flex-1 gap-2">
                {loading ? (
                  <><span className="animate-spin border-2 border-white border-t-transparent rounded-full w-4 h-4 inline-block" /> Importing...</>
                ) : (
                  <><Upload className="w-4 h-4" /> Import করুন</>
                )}
              </Button>
            </div>
          </div>
        )}

        {step === "result" && result && (
          <div className="space-y-4">
            <div className={`rounded-lg p-4 flex items-start gap-3 ${result.errors === 0 ? "bg-green-500/10 text-green-700" : "bg-yellow-500/10 text-yellow-700"}`}>
              <CheckCircle2 className="w-6 h-6 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold text-lg">{result.imported}টি product সফলভাবে import হয়েছে!</p>
                <p className="text-sm opacity-80">মোট {result.total}টির মধ্যে {result.errors}টি error হয়েছে।</p>
              </div>
            </div>

            {result.errorDetails.length > 0 && (
              <div className="space-y-1">
                <p className="text-sm font-semibold text-destructive">Error details:</p>
                <div className="bg-muted/50 rounded p-3 space-y-1 max-h-40 overflow-y-auto">
                  {result.errorDetails.map((e, i) => (
                    <p key={i} className="text-xs text-muted-foreground">Row {e.row}: {e.error}</p>
                  ))}
                </div>
              </div>
            )}

            <Button className="w-full" onClick={() => { setOpen(false); reset(); }}>
              সম্পন্ন হয়েছে
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}

export function AdminProducts() {
  const { data: productsData } = useListProducts();
  const { data: categories } = useListCategories();
  const createProduct = useCreateProduct();
  const updateProduct = useUpdateProduct();
  const deleteProduct = useDeleteProduct();
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    price: 0,
    comparePrice: 0,
    categoryId: undefined as number | undefined,
    stock: 0,
    featured: false,
    badge: "",
    images: [] as string[]
  });

  const resetForm = () => {
    setFormData({
      name: "", description: "", price: 0, comparePrice: 0, categoryId: undefined, stock: 0, featured: false, badge: "", images: []
    });
    setEditingId(null);
  };

  const handleEdit = (product: any) => {
    setFormData({
      name: product.name,
      description: product.description || "",
      price: product.price,
      comparePrice: product.comparePrice || 0,
      categoryId: product.categoryId || undefined,
      stock: product.stock,
      featured: product.featured || false,
      badge: product.badge || "",
      images: product.images || []
    });
    setEditingId(product.id);
    setIsOpen(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1];
      
      try {
        const res = await uploadFile.mutateAsync({
          data: {
            data: base64Data,
            filename: file.name,
            mimeType: file.type
          }
        });
        setFormData(prev => ({ ...prev, images: [...prev.images, res.url] }));
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateProduct.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    } else {
      createProduct.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Products</h1>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => {
              const a = document.createElement("a");
              a.href = "/api/products/export";
              a.download = "products-export.csv";
              a.click();
            }}
          >
            <FileDown className="w-4 h-4" />
            Export CSV
          </Button>
          <CsvImportDialog onDone={() => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })} />
          <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
            <DialogTrigger asChild>
              <Button className="gap-2"><Plus className="w-4 h-4" /> Add Product</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{editingId ? "Edit Product" : "Add Product"}</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Name</Label>
                    <Input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Category</Label>
                    <Select 
                      value={formData.categoryId?.toString()} 
                      onValueChange={v => setFormData({...formData, categoryId: Number(v)})}
                    >
                      <SelectTrigger><SelectValue placeholder="Select Category" /></SelectTrigger>
                      <SelectContent>
                        {categories?.map(cat => (
                          <SelectItem key={cat.id} value={cat.id.toString()}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Price (BDT)</Label>
                    <Input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Compare Price (BDT)</Label>
                    <Input type="number" value={formData.comparePrice || ''} onChange={e => setFormData({...formData, comparePrice: Number(e.target.value)})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Stock</Label>
                    <Input type="number" required value={formData.stock || ''} onChange={e => setFormData({...formData, stock: Number(e.target.value)})} />
                  </div>
                  <div className="space-y-2">
                    <Label>Badge (e.g. NEW, SALE)</Label>
                    <Input value={formData.badge} onChange={e => setFormData({...formData, badge: e.target.value})} />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Textarea value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} />
                </div>
                <div className="flex items-center gap-2">
                  <Switch 
                    id="featured" 
                    checked={formData.featured} 
                    onCheckedChange={c => setFormData({...formData, featured: c})} 
                  />
                  <Label htmlFor="featured">Featured Product</Label>
                </div>
                <div className="space-y-2">
                  <Label>Images</Label>
                  <div className="flex gap-4 flex-wrap">
                    {formData.images.map((img, i) => (
                      <div key={i} className="relative w-20 h-20 border rounded-md overflow-hidden group">
                        <img src={img} alt="preview" className="w-full h-full object-cover" />
                        <button 
                          type="button"
                          className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => setFormData({...formData, images: formData.images.filter((_, idx) => idx !== i)})}
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <div className="w-20 h-20 border-2 border-dashed rounded-md flex items-center justify-center relative hover:bg-muted transition-colors cursor-pointer">
                      <ImageIcon className="w-6 h-6 text-muted-foreground" />
                      <input 
                        type="file" 
                        accept="image/*" 
                        className="absolute inset-0 opacity-0 cursor-pointer"
                        onChange={handleFileUpload}
                        disabled={uploadFile.isPending}
                      />
                    </div>
                  </div>
                </div>
                <Button type="submit" className="w-full" disabled={createProduct.isPending || updateProduct.isPending || uploadFile.isPending}>
                  {editingId ? "Update Product" : "Save Product"}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-16">Image</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Price</TableHead>
              <TableHead>Stock</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {productsData?.products?.map(product => (
              <TableRow key={product.id}>
                <TableCell>
                  <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                    {product.images?.[0] && <img src={product.images[0]} alt={product.name} className="w-full h-full object-cover" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{product.name} {product.featured && <span className="ml-2 text-[10px] bg-primary/20 text-primary px-2 py-0.5 rounded-full uppercase font-bold">Featured</span>}</TableCell>
                <TableCell>{product.categoryName || '-'}</TableCell>
                <TableCell>BDT {product.price}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(product)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => {
                      if(confirm("Are you sure?")) {
                        deleteProduct.mutate({ id: product.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListProductsQueryKey() })
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!productsData?.products || productsData.products.length === 0) && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No products found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
