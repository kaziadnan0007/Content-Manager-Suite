import { AdminLayout } from "@/components/layout/admin-layout";
import { useListCategories, useCreateCategory, useUpdateCategory, useDeleteCategory, useUploadFile, getListCategoriesQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, Image as ImageIcon } from "lucide-react";

export function AdminCategories() {
  const { data: categories } = useListCategories();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    image: ""
  });

  const resetForm = () => {
    setFormData({ name: "", slug: "", image: "" });
    setEditingId(null);
  };

  const handleEdit = (category: any) => {
    setFormData({
      name: category.name,
      slug: category.slug,
      image: category.image || ""
    });
    setEditingId(category.id);
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
        setFormData(prev => ({ ...prev, image: res.url }));
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateCategory.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    } else {
      createCategory.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Category" : "Add Category"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Name</Label>
                <Input required value={formData.name} onChange={e => {
                  const name = e.target.value;
                  // Auto-generate slug if not editing
                  if (!editingId && (!formData.slug || formData.slug === formData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, ''))) {
                    setFormData({...formData, name, slug: name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '')});
                  } else {
                    setFormData({...formData, name});
                  }
                }} />
              </div>
              <div className="space-y-2">
                <Label>Slug</Label>
                <Input required value={formData.slug} onChange={e => setFormData({...formData, slug: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Image</Label>
                <div className="flex gap-4 items-center">
                  {formData.image && (
                    <div className="relative w-20 h-20 border rounded-md overflow-hidden group">
                      <img src={formData.image} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setFormData({...formData, image: ""})}
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                  {!formData.image && (
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
                  )}
                </div>
              </div>
              <Button type="submit" className="w-full" disabled={createCategory.isPending || updateCategory.isPending || uploadFile.isPending}>
                {editingId ? "Update Category" : "Save Category"}
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
              <TableHead>Slug</TableHead>
              <TableHead>Products</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {categories?.map(category => (
              <TableRow key={category.id}>
                <TableCell>
                  <div className="w-10 h-10 bg-muted rounded overflow-hidden">
                    {category.image && <img src={category.image} alt={category.name} className="w-full h-full object-cover" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">{category.name}</TableCell>
                <TableCell>{category.slug}</TableCell>
                <TableCell>{category.productCount || 0}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => {
                      if(confirm("Are you sure?")) {
                        deleteCategory.mutate({ id: category.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListCategoriesQueryKey() })
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!categories || categories.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No categories found. Add one to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
