import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { 
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger 
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Edit, 
  Trash2, 
  Upload, 
  Home, 
  DollarSign,
  Users,
  TrendingUp,
  Loader2
} from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import type { Property, InsertProperty } from "@shared/schema";

export default function AdminPanel() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    price: "",
    city: "",
    state: "",
    propertyType: "house",
    listingType: "sale",
    bedrooms: "1",
    bathrooms: "1", 
    sqft: "",
    description: "",
    carSpaces: "1",
    strongPoints: "",
    mapEmbedUrl: "",
    iptu: ""
  });
  const { toast } = useToast();

  // Fetch properties
  const { data: apiResponse, isLoading, refetch } = useQuery({
    queryKey: ['/api/properties?limit=100']
  });

  const properties = (apiResponse as any)?.data || [];

  const stats = [
    { icon: Home, label: "Total de propriedades", value: properties.length, color: "text-chart-1" },
    { icon: DollarSign, label: "Propriedades ativas", value: properties.filter((p: Property) => p.status === 'active').length, color: "text-chart-2" },
    { icon: Users, label: "Vendas pendentes", value: properties.filter((p: Property) => p.status === 'pending').length, color: "text-chart-3" },
    { icon: TrendingUp, label: "Vendidas este mês", value: properties.filter((p: Property) => p.status === 'sold').length, color: "text-chart-4" }
  ];

  // Create property mutation
  const createMutation = useMutation({
    mutationFn: (data: InsertProperty) => apiRequest('POST', '/api/properties', data).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Property created successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setIsAddDialogOpen(false);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error creating property", 
        description: error?.message || "Failed to create property",
        variant: "destructive" 
      });
    }
  });

  // Update property mutation
  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<InsertProperty> }) => 
      apiRequest('PUT', `/api/properties/${id}`, data).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Property updated successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      setIsEditDialogOpen(false);
      setEditingProperty(null);
      resetForm();
    },
    onError: (error: any) => {
      toast({ 
        title: "Error updating property", 
        description: error?.message || "Failed to update property",
        variant: "destructive" 
      });
    }
  });

  // Delete property mutation
  const deleteMutation = useMutation({
    mutationFn: (id: string) => apiRequest('DELETE', `/api/properties/${id}`).then(res => res.json()),
    onSuccess: () => {
      toast({ title: "Property deleted successfully" });
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
    },
    onError: (error: any) => {
      toast({ 
        title: "Error deleting property",
        description: error?.message || "Failed to delete property", 
        variant: "destructive" 
      });
    }
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const resetForm = () => {
    setFormData({
      title: "",
      price: "",
      city: "",
      state: "",
      propertyType: "house",
      listingType: "sale",
      bedrooms: "1",
      bathrooms: "1",
      sqft: "",
      description: "",
      carSpaces: "1",
      strongPoints: "",
      mapEmbedUrl: "",
      iptu: ""
    });
    setSelectedImages([]);
    setImageUrls([]);
  };

  const uploadImages = async (): Promise<string[]> => {
    if (selectedImages.length === 0) return imageUrls;
    
    setIsUploading(true);
    try {
      const formData = new FormData();
      selectedImages.forEach(file => {
        formData.append('images', file);
      });

      const response = await apiRequest('POST', '/api/properties/upload-images', formData);
      const result = await response.json();
      
      if (result.success) {
        const newUrls = [...imageUrls, ...result.data.imageUrls];
        setImageUrls(newUrls);
        setSelectedImages([]);
        return newUrls;
      } else {
        throw new Error(result.error || 'Failed to upload images');
      }
    } catch (error) {
      console.error('Error uploading images:', error);
      toast({
        title: "Error uploading images",
        description: error instanceof Error ? error.message : "Failed to upload images",
        variant: "destructive"
      });
      return imageUrls;
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddProperty = async () => {
    const uploadedImageUrls = await uploadImages();
    
    const strongPointsArray = formData.strongPoints
      ? formData.strongPoints.split(',').map(point => point.trim()).filter(point => point.length > 0)
      : [];
    
    const propertyData: InsertProperty = {
      title: formData.title,
      price: formData.price, // Keep as string since schema expects decimal as string
      location: `${formData.city}, ${formData.state}`,
      city: formData.city,
      state: formData.state,
      propertyType: formData.propertyType,
      listingType: formData.listingType as 'sale' | 'rent',
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      sqft: parseInt(formData.sqft),
      description: formData.description || null,
      images: uploadedImageUrls,
      carSpaces: parseInt(formData.carSpaces),
      strongPoints: strongPointsArray,
      mapEmbedUrl: formData.mapEmbedUrl || null,
      iptu: formData.iptu || null
    };

    createMutation.mutate(propertyData);
  };

  const handleEditProperty = (property: Property) => {
    setEditingProperty(property);
    setFormData({
      title: property.title,
      price: property.price.toString(),
      city: property.city,
      state: property.state,
      propertyType: property.propertyType,
      listingType: property.listingType,
      bedrooms: property.bedrooms.toString(),
      bathrooms: property.bathrooms.toString(),
      sqft: property.sqft.toString(),
      description: property.description || "",
      carSpaces: (property.carSpaces || 1).toString(),
      strongPoints: (property.strongPoints || []).join(', '),
      mapEmbedUrl: property.mapEmbedUrl || "",
      iptu: property.iptu?.toString() || ""
    });
    setImageUrls(property.images || []);
    setSelectedImages([]);
    setIsEditDialogOpen(true);
  };

  const handleUpdateProperty = async () => {
    if (!editingProperty) return;
    
    const uploadedImageUrls = await uploadImages();
    
    const strongPointsArray = formData.strongPoints
      ? formData.strongPoints.split(',').map(point => point.trim()).filter(point => point.length > 0)
      : [];
    
    const propertyData: Partial<InsertProperty> = {
      title: formData.title,
      price: formData.price,
      location: `${formData.city}, ${formData.state}`,
      city: formData.city,
      state: formData.state,
      propertyType: formData.propertyType,
      listingType: formData.listingType as 'sale' | 'rent',
      bedrooms: parseInt(formData.bedrooms),
      bathrooms: parseInt(formData.bathrooms),
      sqft: parseInt(formData.sqft),
      description: formData.description || null,
      images: uploadedImageUrls,
      carSpaces: parseInt(formData.carSpaces),
      strongPoints: strongPointsArray,
      mapEmbedUrl: formData.mapEmbedUrl || null,
      iptu: formData.iptu || null
    };

    updateMutation.mutate({ id: editingProperty.id, data: propertyData });
  };

  const handleDeleteProperty = (id: string) => {
    deleteMutation.mutate(id);
  };

  const handleImageSelection = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Some files were ignored",
        description: "Only image files are allowed",
        variant: "destructive"
      });
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    const files = Array.from(event.dataTransfer.files);
    const imageFiles = files.filter(file => file.type.startsWith('image/'));
    
    if (imageFiles.length !== files.length) {
      toast({
        title: "Some files were ignored",
        description: "Only image files are allowed",
        variant: "destructive"
      });
    }
    
    setSelectedImages(prev => [...prev, ...imageFiles]);
  };

  const removeImage = (index: number, isUrl: boolean = false) => {
    if (isUrl) {
      setImageUrls(prev => prev.filter((_, i) => i !== index));
    } else {
      setSelectedImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const ImageUploadComponent = ({ testIdPrefix }: { testIdPrefix: string }) => {
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    
    return (
      <div className="space-y-2">
        <Label>Imagens do imóvel</Label>
        <div 
          className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center cursor-pointer hover:border-muted-foreground/50 transition-colors"
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <Upload className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p className="text-sm text-muted-foreground mb-2">
            Arraste e solte as imagens aqui, ou clique para procurar
          </p>
          <Button variant="outline" size="sm" data-testid={`button-${testIdPrefix}-upload-images`}>
            Selecione os arquivos
          </Button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            className="hidden"
            onChange={handleImageSelection}
          />
        </div>
        
        {/* Image Preview */}
        {(imageUrls.length > 0 || selectedImages.length > 0) && (
          <div className="grid grid-cols-3 gap-2 mt-4">
            {/* Existing images (URLs) */}
            {imageUrls.map((url, index) => (
              <div key={`url-${index}`} className="relative group">
                <img
                  src={url}
                  alt={`Property image ${index + 1}`}
                  className="w-full h-24 object-cover rounded border"
                />
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    removeImage(index, true);
                  }}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
            
            {/* New selected images (Files) */}
            {selectedImages.map((file, index) => {
              const url = URL.createObjectURL(file);
              return (
                <div key={`file-${index}`} className="relative group">
                  <img
                    src={url}
                    alt={`New image ${index + 1}`}
                    className="w-full h-24 object-cover rounded border"
                  />
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeImage(index, false);
                      URL.revokeObjectURL(url);
                    }}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                  <div className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-1 rounded">
                    New
                  </div>
                </div>
              );
            })}
          </div>
        )}
        
        {isUploading && (
          <div className="flex items-center justify-center p-4">
            <Loader2 className="h-6 w-6 animate-spin mr-2" />
            <span className="text-sm">Uploading images...</span>
          </div>
        )}
      </div>
    );
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'default';
      case 'pending': return 'secondary';
      case 'sold': return 'destructive';
      default: return 'default';
    }
  };

  const translateStatus = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "pending":
        return "Pendente";
      case "sold":
        return "Vendido";
      case "inactive":
        return "Inativo";
      default:
        return status;
    }
  };

  const translateListingType = (listingType: string) => {
    switch (listingType) {
      case "sale":
        return "Venda";
      case "rent":
        return "Aluguel";
      default:
        return listingType;
    }
  };

  const translatePropertyType = (propertyType: string) => {
    switch (propertyType) {
      case "house":
        return "Casa";
      case "apartment":
        return "Apartamento";
      case "condo":
        return "Condomínio";
      case "townhouse":
        return "Sobrado";
      case "villa":
        return "Vila";
      default:
        return propertyType;
    }
  };

  return (
    <div className="container mx-auto px-4 py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold"> DashAdminboard</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-property">
              <Plus className="h-4 w-4 mr-2" />
              Adicionar Imóvel
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Adicionar Imóvel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Título do Imóvel</Label>
                  <Input
                    id="title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Linda casa a venda em Rio de Janeiro"
                    data-testid="input-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="price">Preço</Label>
                  <Input
                    id="price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="R$ 1.250,00"
                    data-testid="input-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">Cidade</Label>
                  <Input
                    id="city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Rio de Janeiro"
                    data-testid="input-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">Endereço</Label>
                  <Input
                    id="state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Avenida das Américas, 3500"
                    data-testid="input-state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de propriedade</Label>
                  <Select 
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                  >
                    <SelectTrigger data-testid="select-property-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="condo">Loja Comercial</SelectItem>
                      <SelectItem value="townhouse">Condomínio</SelectItem>
                      <SelectItem value="villa">Casa em Vila</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.listingType}
                    onValueChange={(value) => handleInputChange('listingType', value)}
                  >
                    <SelectTrigger data-testid="select-listing-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sqft">Metros Quadrados</Label>
                  <Input
                    id="sqft"
                    value={formData.sqft}
                    onChange={(e) => handleInputChange('sqft', e.target.value)}
                    placeholder="80"
                    type="number"
                    data-testid="input-sqft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Select 
                    value={formData.bedrooms}
                    onValueChange={(value) => handleInputChange('bedrooms', value)}
                  >
                    <SelectTrigger data-testid="select-beds">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Quarto</SelectItem>
                      <SelectItem value="2">2 Quartos</SelectItem>
                      <SelectItem value="3">3 Quartos</SelectItem>
                      <SelectItem value="4">4 Quartos</SelectItem>
                      <SelectItem value="5">5+ Quartos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Banheiros</Label>
                  <Select 
                    value={formData.bathrooms}
                    onValueChange={(value) => handleInputChange('bathrooms', value)}
                  >
                    <SelectTrigger data-testid="select-baths">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Banheiro</SelectItem>
                      <SelectItem value="2">2 Banheiros</SelectItem>
                      <SelectItem value="3">3 Banheiros</SelectItem>
                      <SelectItem value="4">4+ Banheiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva a propriedade colocando seus principais pontos fortes."
                  rows={3}
                  data-testid="textarea-description"
                />
              </div>

              <div className="space-y-2">
                <Label>Vagas de Carro</Label>
                <Select 
                  value={formData.carSpaces}
                  onValueChange={(value) => handleInputChange('carSpaces', value)}
                >
                  <SelectTrigger data-testid="select-car-spaces">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Vaga</SelectItem>
                    <SelectItem value="2">2 Vagas</SelectItem>
                    <SelectItem value="3">3 Vagas</SelectItem>
                    <SelectItem value="4">4 Vagas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="strongPoints">Pontos Fortes</Label>
                <Input
                  id="strongPoints"
                  value={formData.strongPoints}
                  onChange={(e) => handleInputChange('strongPoints', e.target.value)}
                  placeholder="Localização privilegiada, Vista para o mar, Piscina, Academia (separados por vírgula)"
                  data-testid="input-strong-points"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="mapEmbedUrl">Link do Mapa Incorporado</Label>
                <Input
                  id="mapEmbedUrl"
                  value={formData.mapEmbedUrl}
                  onChange={(e) => handleInputChange('mapEmbedUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  data-testid="input-map-embed-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="iptu">IPTU (R$)</Label>
                <Input
                  id="iptu"
                  value={formData.iptu || ''}
                  onChange={(e) => handleInputChange('iptu', e.target.value)}
                  placeholder="R$ 1.500,00"
                  data-testid="input-iptu"
                />
              </div>

              <ImageUploadComponent testIdPrefix="add" />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsAddDialogOpen(false)}
                  data-testid="button-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleAddProperty}
                  disabled={!formData.title || !formData.price || !formData.city || !formData.state || createMutation.isPending || isUploading}
                  data-testid="button-save-property"
                >
                  {(createMutation.isPending || isUploading) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Adding..."}
                    </>
                  ) : (
                    "Adicionar imóvel"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Edit Property Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Editar o imóvel</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-title">Título do Imóvel</Label>
                  <Input
                    id="edit-title"
                    value={formData.title}
                    onChange={(e) => handleInputChange('title', e.target.value)}
                    placeholder="Modern Luxury Villa"
                    data-testid="input-edit-title"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-price">Preço</Label>
                  <Input
                    id="edit-price"
                    value={formData.price}
                    onChange={(e) => handleInputChange('price', e.target.value)}
                    placeholder="R$ 1.250,00"
                    data-testid="input-edit-price"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="edit-city">Cidade</Label>
                  <Input
                    id="edit-city"
                    value={formData.city}
                    onChange={(e) => handleInputChange('city', e.target.value)}
                    placeholder="Rio de Janeiro"
                    data-testid="input-edit-city"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-state">Endereço</Label>
                  <Input
                    id="edit-state"
                    value={formData.state}
                    onChange={(e) => handleInputChange('state', e.target.value)}
                    placeholder="Avenida das Américas, 3500"
                    data-testid="input-edit-state"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Tipo de propriedade</Label>
                  <Select 
                    value={formData.propertyType}
                    onValueChange={(value) => handleInputChange('propertyType', value)}
                  >
                    <SelectTrigger data-testid="select-edit-property-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="house">Casa</SelectItem>
                      <SelectItem value="apartment">Apartamento</SelectItem>
                      <SelectItem value="condo">Loja Comercial</SelectItem>
                      <SelectItem value="townhouse">Condomínio</SelectItem>
                      <SelectItem value="villa">Casa em Vila</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Tipo</Label>
                  <Select 
                    value={formData.listingType}
                    onValueChange={(value) => handleInputChange('listingType', value)}
                  >
                    <SelectTrigger data-testid="select-edit-listing-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sale">Venda</SelectItem>
                      <SelectItem value="rent">Aluguel</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="edit-sqft">Metros Quadrados</Label>
                  <Input
                    id="edit-sqft"
                    value={formData.sqft}
                    onChange={(e) => handleInputChange('sqft', e.target.value)}
                    placeholder="120"
                    type="number"
                    data-testid="input-edit-sqft"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Quartos</Label>
                  <Select 
                    value={formData.bedrooms}
                    onValueChange={(value) => handleInputChange('bedrooms', value)}
                  >
                    <SelectTrigger data-testid="select-edit-beds">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Quarto</SelectItem>
                      <SelectItem value="2">2 Quartos</SelectItem>
                      <SelectItem value="3">3 Quartos</SelectItem>
                      <SelectItem value="4">4 Quartos</SelectItem>
                      <SelectItem value="5">5+ Quartos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Banheiros</Label>
                  <Select 
                    value={formData.bathrooms}
                    onValueChange={(value) => handleInputChange('bathrooms', value)}
                  >
                    <SelectTrigger data-testid="select-edit-baths">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 Banheiro</SelectItem>
                      <SelectItem value="2">2 Banheiros</SelectItem>
                      <SelectItem value="3">3 Banheiros</SelectItem>
                      <SelectItem value="4">4+ Banheiros</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-description">Descrição</Label>
                <Textarea
                  id="edit-description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Descreva sua propriedade colocando os pontos fortes."
                  rows={3}
                  data-testid="textarea-edit-description"
                />
              </div>

              <div className="space-y-2">
                <Label>Vagas de Carro</Label>
                <Select 
                  value={formData.carSpaces}
                  onValueChange={(value) => handleInputChange('carSpaces', value)}
                >
                  <SelectTrigger data-testid="select-edit-car-spaces">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Vaga</SelectItem>
                    <SelectItem value="2">2 Vagas</SelectItem>
                    <SelectItem value="3">3 Vagas</SelectItem>
                    <SelectItem value="4">4 Vagas</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-strongPoints">Pontos Fortes</Label>
                <Input
                  id="edit-strongPoints"
                  value={formData.strongPoints}
                  onChange={(e) => handleInputChange('strongPoints', e.target.value)}
                  placeholder="Localização privilegiada, Vista para o mar, Piscina, Academia (separados por vírgula)"
                  data-testid="input-edit-strong-points"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-mapEmbedUrl">Link do Mapa Incorporado</Label>
                <Input
                  id="edit-mapEmbedUrl"
                  value={formData.mapEmbedUrl}
                  onChange={(e) => handleInputChange('mapEmbedUrl', e.target.value)}
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  data-testid="input-edit-map-embed-url"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="edit-iptu">IPTU (R$)</Label>
                <Input
                  id="edit-iptu"
                  value={formData.iptu || ''}
                  onChange={(e) => handleInputChange('iptu', e.target.value)}
                  placeholder="R$ 1.500,00"
                  data-testid="input-edit-iptu"
                />
              </div>

              <ImageUploadComponent testIdPrefix="edit" />

              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => {
                    setIsEditDialogOpen(false);
                    setEditingProperty(null);
                    resetForm();
                  }}
                  data-testid="button-edit-cancel"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleUpdateProperty}
                  disabled={!formData.title || !formData.price || !formData.city || !formData.state || updateMutation.isPending || isUploading}
                  data-testid="button-update-property"
                >
                  {(updateMutation.isPending || isUploading) ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      {isUploading ? "Uploading..." : "Updating..."}
                    </>
                  ) : (
                    "Atualizar Imóvel"
                  )}
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">
                    {stat.label}
                  </p>
                  <p className="text-2xl font-bold" data-testid={`stat-${index}`}>
                    {stat.value}
                  </p>
                </div>
                <stat.icon className={`h-8 w-8 ${stat.color}`} />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Properties Table */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Imóveis</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {properties.map((property: Property) => (
              <div 
                key={property.id} 
                className="flex items-center justify-between p-4 border rounded-lg hover-elevate"
                data-testid={`property-row-${property.id}`}
              >
                <div className="flex-1">
                  <h3 className="font-semibold">{property.title}</h3>
                  <p className="text-sm text-muted-foreground">{property.location}</p>
                  <div className="flex items-center gap-4 mt-2 text-sm">
                    <span className="font-medium text-primary">
                      R$ {Number(property.price).toLocaleString()}{property.listingType === 'rent' ? '/mês' : ''}
                    </span>
                    <span>{property.bedrooms} camas • {property.bathrooms} banheiros</span>
                    <span>{property.sqft.toLocaleString()} m²</span>
                    <span>{translatePropertyType(property.propertyType)}</span>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge 
                    variant={getStatusColor(property.status) as any}
                  >
                    {translateStatus(property.status)}
                  </Badge>
                  <Badge variant="outline">
                    {translateListingType(property.listingType)}
                  </Badge>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleEditProperty(property)}
                    data-testid={`button-edit-${property.id}`}
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                  <Button 
                    variant="ghost" 
                    size="icon"
                    onClick={() => handleDeleteProperty(property.id)}
                    data-testid={`button-delete-${property.id}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}