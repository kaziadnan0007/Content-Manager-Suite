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
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, Image as ImageIcon } from "lucide-react";

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
      // Extract just the base64 part
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
                  <Label>Price (BDT )</Label>
                  <Input type="number" required value={formData.price || ''} onChange={e => setFormData({...formData, price: Number(e.target.value)})} />
                </div>
                <div className="space-y-2">
                  <Label>Compare Price (BDT )</Label>
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
