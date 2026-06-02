import { AdminLayout } from "@/components/layout/admin-layout";
import { useListBanners, useCreateBanner, useUpdateBanner, useDeleteBanner, useUploadFile, getListBannersQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, Edit, Plus, Image as ImageIcon } from "lucide-react";

export function AdminBanners() {
  const { data: banners } = useListBanners();
  const createBanner = useCreateBanner();
  const updateBanner = useUpdateBanner();
  const deleteBanner = useDeleteBanner();
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();

  const [isOpen, setIsOpen] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    imageUrl: "",
    linkUrl: "",
    sortOrder: 0,
    active: true
  });

  const resetForm = () => {
    setFormData({ title: "", subtitle: "", imageUrl: "", linkUrl: "", sortOrder: 0, active: true });
    setEditingId(null);
  };

  const handleEdit = (banner: any) => {
    setFormData({
      title: banner.title,
      subtitle: banner.subtitle || "",
      imageUrl: banner.imageUrl,
      linkUrl: banner.linkUrl || "",
      sortOrder: banner.sortOrder || 0,
      active: banner.active
    });
    setEditingId(banner.id);
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
        setFormData(prev => ({ ...prev, imageUrl: res.url }));
      } catch (err) {
        console.error("Upload failed", err);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingId) {
      updateBanner.mutate({ id: editingId, data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    } else {
      createBanner.mutate({ data: formData }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() });
          setIsOpen(false);
          resetForm();
        }
      });
    }
  };

  return (
    <AdminLayout>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Banners</h1>
        <Dialog open={isOpen} onOpenChange={(open) => { setIsOpen(open); if(!open) resetForm(); }}>
          <DialogTrigger asChild>
            <Button className="gap-2"><Plus className="w-4 h-4" /> Add Banner</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? "Edit Banner" : "Add Banner"}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label>Title</Label>
                <Input required value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Subtitle</Label>
                <Input value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
              </div>
              <div className="space-y-2">
                <Label>Link URL</Label>
                <Input value={formData.linkUrl} onChange={e => setFormData({...formData, linkUrl: e.target.value})} placeholder="/products" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Sort Order</Label>
                  <Input type="number" required value={formData.sortOrder} onChange={e => setFormData({...formData, sortOrder: Number(e.target.value)})} />
                </div>
                <div className="flex items-center gap-2 mt-8">
                  <Switch 
                    id="active" 
                    checked={formData.active} 
                    onCheckedChange={c => setFormData({...formData, active: c})} 
                  />
                  <Label htmlFor="active">Active</Label>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Banner Image (Landscape recommended)</Label>
                <div className="flex flex-col gap-4">
                  {formData.imageUrl && (
                    <div className="relative w-full h-40 border rounded-md overflow-hidden group">
                      <img src={formData.imageUrl} alt="preview" className="w-full h-full object-cover" />
                      <button 
                        type="button"
                        className="absolute inset-0 bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => setFormData({...formData, imageUrl: ""})}
                      >
                        <Trash2 className="w-8 h-8" />
                      </button>
                    </div>
                  )}
                  {!formData.imageUrl && (
                    <div className="w-full h-32 border-2 border-dashed rounded-md flex items-center justify-center relative hover:bg-muted transition-colors cursor-pointer">
                      <ImageIcon className="w-8 h-8 text-muted-foreground" />
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
              <Button type="submit" className="w-full" disabled={createBanner.isPending || updateBanner.isPending || uploadFile.isPending}>
                {editingId ? "Update Banner" : "Save Banner"}
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="bg-card border rounded-lg overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-32">Image</TableHead>
              <TableHead>Title</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {banners?.sort((a, b) => a.sortOrder - b.sortOrder).map(banner => (
              <TableRow key={banner.id}>
                <TableCell>
                  <div className="w-24 h-12 bg-muted rounded overflow-hidden">
                    {banner.imageUrl && <img src={banner.imageUrl} alt={banner.title} className="w-full h-full object-cover" />}
                  </div>
                </TableCell>
                <TableCell className="font-medium">
                  {banner.title}
                  {banner.linkUrl && <div className="text-xs text-muted-foreground font-normal">{banner.linkUrl}</div>}
                </TableCell>
                <TableCell>{banner.sortOrder}</TableCell>
                <TableCell>
                  <span className={`px-2 py-1 rounded-full text-xs font-bold ${banner.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                    {banner.active ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleEdit(banner)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="text-destructive"
                    onClick={() => {
                      if(confirm("Are you sure?")) {
                        deleteBanner.mutate({ id: banner.id }, {
                          onSuccess: () => queryClient.invalidateQueries({ queryKey: getListBannersQueryKey() })
                        });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {(!banners || banners.length === 0) && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  No banners found. Add one for your homepage hero section.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </AdminLayout>
  );
}
