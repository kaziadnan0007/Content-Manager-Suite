import { AdminLayout } from "@/components/layout/admin-layout";
import { useGetSettings, useUpdateSettings, useUploadFile, getGetSettingsQueryKey } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useState, useEffect, useRef } from "react";
import { useQueryClient } from "@tanstack/react-query";
import {
  Save,
  Image as ImageIcon,
  Trash2,
  Upload,
  Loader2,
  Store,
  CreditCard,
  Share2,
  Megaphone,
  Layout,
  CheckCircle2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function AdminSettings() {
  const { data: settings, isLoading } = useGetSettings();
  const updateSettings = useUpdateSettings();
  const uploadFile = useUploadFile();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const logoInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState({
    siteName: "",
    tagline: "",
    logoUrl: "",
    faviconUrl: "",
    bkashNumber: "",
    rocketNumber: "",
    facebookUrl: "",
    whatsappNumber: "",
    instagramUrl: "",
    footerText: "",
    heroTitle: "",
    heroSubtitle: "",
    announcementText: "",
    showAnnouncement: false,
  });

  const [logoPreview, setLogoPreview] = useState<string>("");
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (settings) {
      setFormData({
        siteName: settings.siteName || "",
        tagline: settings.tagline || "",
        logoUrl: settings.logoUrl || "",
        faviconUrl: settings.faviconUrl || "",
        bkashNumber: settings.bkashNumber || "",
        rocketNumber: settings.rocketNumber || "",
        facebookUrl: settings.facebookUrl || "",
        whatsappNumber: settings.whatsappNumber || "",
        instagramUrl: settings.instagramUrl || "",
        footerText: settings.footerText || "",
        heroTitle: settings.heroTitle || "",
        heroSubtitle: settings.heroSubtitle || "",
        announcementText: settings.announcementText || "",
        showAnnouncement: settings.showAnnouncement || false,
      });
      setLogoPreview(settings.logoUrl || "");
    }
  }, [settings]);

  const set = (key: keyof typeof formData, value: string | boolean) => {
    setFormData((prev) => ({ ...prev, [key]: value }));
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64 = event.target?.result as string;
      const base64Data = base64.split(",")[1] ?? "";

      try {
        const res = await uploadFile.mutateAsync({
          data: { data: base64Data, filename: file.name, mimeType: file.type },
        });
        setFormData((prev) => ({ ...prev, logoUrl: res.url }));
        setLogoPreview(res.url);
        toast({ title: "Logo uploaded!", description: "Save settings to apply." });
      } catch {
        toast({ title: "Upload failed", variant: "destructive" });
      }
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings.mutate({ data: formData }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getGetSettingsQueryKey() });
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        toast({ title: "Settings saved!", description: "All changes are now live." });
      },
      onError: () => {
        toast({ title: "Save failed", variant: "destructive" });
      },
    });
  };

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <form onSubmit={handleSubmit}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold">Store Settings</h1>
            <p className="text-muted-foreground mt-1">Manage your site identity, payment info, and social links</p>
          </div>
          <Button
            type="submit"
            size="lg"
            disabled={updateSettings.isPending || uploadFile.isPending}
            className="gap-2 min-w-[140px]"
          >
            {updateSettings.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : saved ? (
              <><CheckCircle2 className="w-4 h-4" /> Saved!</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* ── LEFT COLUMN ─────────────────────────────── */}
          <div className="space-y-6">

            {/* General Identity */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Store className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Store Identity</CardTitle>
                </div>
                <CardDescription>Your brand name, tagline, and logo</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="siteName">Site Name <span className="text-destructive">*</span></Label>
                  <Input
                    id="siteName"
                    value={formData.siteName}
                    onChange={(e) => set("siteName", e.target.value)}
                    placeholder="ShopBD"
                    required
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="tagline">Tagline</Label>
                  <Input
                    id="tagline"
                    value={formData.tagline}
                    onChange={(e) => set("tagline", e.target.value)}
                    placeholder="আপনার পছন্দের অনলাইন শপ"
                  />
                </div>

                {/* Logo Upload */}
                <div className="space-y-2">
                  <Label>Store Logo</Label>
                  {logoPreview ? (
                    <div className="flex items-center gap-3">
                      <div className="relative w-36 h-14 border-2 rounded-lg bg-muted flex items-center justify-center overflow-hidden group">
                        <img src={logoPreview} alt="Logo" className="max-h-full max-w-full object-contain p-2" />
                        <div className="absolute inset-0 bg-black/60 text-white flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button
                            type="button"
                            onClick={() => { setLogoPreview(""); set("logoUrl", ""); }}
                            className="p-1 rounded hover:text-red-300"
                            title="Remove logo"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => logoInputRef.current?.click()}
                            className="p-1 rounded hover:text-green-300"
                            title="Change logo"
                          >
                            <Upload className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">Hover to change or remove</p>
                    </div>
                  ) : (
                    <div
                      onClick={() => logoInputRef.current?.click()}
                      className="w-full h-24 border-2 border-dashed rounded-lg flex flex-col items-center justify-center gap-2 hover:bg-muted/50 transition-colors cursor-pointer relative"
                    >
                      {uploadFile.isPending ? (
                        <Loader2 className="w-6 h-6 animate-spin text-primary" />
                      ) : (
                        <>
                          <ImageIcon className="w-6 h-6 text-muted-foreground" />
                          <span className="text-sm text-muted-foreground">Click to upload logo</span>
                          <span className="text-xs text-muted-foreground">PNG, JPG, SVG — max 5MB</span>
                        </>
                      )}
                    </div>
                  )}
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleLogoUpload}
                    disabled={uploadFile.isPending}
                  />
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="footerText">Footer Text</Label>
                  <Input
                    id="footerText"
                    value={formData.footerText}
                    onChange={(e) => set("footerText", e.target.value)}
                    placeholder="© 2025 ShopBD. All rights reserved."
                  />
                </div>
              </CardContent>
            </Card>

            {/* Hero Section */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Layout className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Hero Section</CardTitle>
                </div>
                <CardDescription>Main banner text on the homepage</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="heroTitle">Hero Title</Label>
                  <Input
                    id="heroTitle"
                    value={formData.heroTitle}
                    onChange={(e) => set("heroTitle", e.target.value)}
                    placeholder="সেরা পণ্য, সেরা দাম"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="heroSubtitle">Hero Subtitle</Label>
                  <Input
                    id="heroSubtitle"
                    value={formData.heroSubtitle}
                    onChange={(e) => set("heroSubtitle", e.target.value)}
                    placeholder="আজই অর্ডার করুন এবং ফ্রি ডেলিভারি পান"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Announcement Bar */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Megaphone className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Announcement Bar</CardTitle>
                </div>
                <CardDescription>Top banner shown to all visitors</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center gap-3">
                  <Switch
                    id="showAnnouncement"
                    checked={formData.showAnnouncement}
                    onCheckedChange={(c) => set("showAnnouncement", c)}
                  />
                  <Label htmlFor="showAnnouncement" className="cursor-pointer">
                    Show announcement bar
                  </Label>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="announcementText">Announcement Text</Label>
                  <Input
                    id="announcementText"
                    value={formData.announcementText}
                    onChange={(e) => set("announcementText", e.target.value)}
                    placeholder="বিশেষ অফার: আজই অর্ডার করুন!"
                    disabled={!formData.showAnnouncement}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* ── RIGHT COLUMN ────────────────────────────── */}
          <div className="space-y-6">

            {/* Payment */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Payment Numbers</CardTitle>
                </div>
                <CardDescription>Shown to customers at checkout</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="bkashNumber">
                    <span className="text-pink-600 font-semibold">bKash</span> Number
                  </Label>
                  <Input
                    id="bkashNumber"
                    value={formData.bkashNumber}
                    onChange={(e) => set("bkashNumber", e.target.value)}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                  />
                </div>
                <Separator />
                <div className="space-y-1.5">
                  <Label htmlFor="rocketNumber">
                    <span className="text-purple-700 font-semibold">Rocket</span> Number
                  </Label>
                  <Input
                    id="rocketNumber"
                    value={formData.rocketNumber}
                    onChange={(e) => set("rocketNumber", e.target.value)}
                    placeholder="01XXXXXXXXX"
                    type="tel"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Social & Contact */}
            <Card>
              <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                  <Share2 className="w-4 h-4 text-primary" />
                  <CardTitle className="text-base">Social & Contact</CardTitle>
                </div>
                <CardDescription>Links shown in footer and floating buttons</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-1.5">
                  <Label htmlFor="whatsappNumber">WhatsApp Number</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">+88</span>
                    <Input
                      id="whatsappNumber"
                      className="pl-12"
                      value={formData.whatsappNumber}
                      onChange={(e) => set("whatsappNumber", e.target.value)}
                      placeholder="01700000000"
                      type="tel"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">Enables the floating WhatsApp chat button</p>
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="facebookUrl">Facebook Page URL</Label>
                  <Input
                    id="facebookUrl"
                    value={formData.facebookUrl}
                    onChange={(e) => set("facebookUrl", e.target.value)}
                    placeholder="https://facebook.com/yourpage"
                    type="url"
                  />
                </div>
                <div className="space-y-1.5">
                  <Label htmlFor="instagramUrl">Instagram URL</Label>
                  <Input
                    id="instagramUrl"
                    value={formData.instagramUrl}
                    onChange={(e) => set("instagramUrl", e.target.value)}
                    placeholder="https://instagram.com/yourhandle"
                    type="url"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Save reminder */}
            <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 text-sm text-muted-foreground">
              <p className="font-medium text-foreground mb-1">Remember to save</p>
              <p>Changes are not applied until you click "Save Changes" above.</p>
            </div>
          </div>
        </div>

        {/* Sticky save at bottom on mobile */}
        <div className="mt-8 flex justify-end md:hidden">
          <Button
            type="submit"
            size="lg"
            disabled={updateSettings.isPending || uploadFile.isPending}
            className="gap-2 w-full"
          >
            {updateSettings.isPending ? (
              <><Loader2 className="w-4 h-4 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4" /> Save Changes</>
            )}
          </Button>
        </div>
      </form>
    </AdminLayout>
  );
}
