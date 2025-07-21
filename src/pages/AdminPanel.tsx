import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { supabase } from '@/integrations/supabase/client';

interface FreeResource {
  id?: string;
  title: string;
  type: 'PDF' | 'VIDEO' | 'TOOL';
  description: string;
  features: string[];
  download_url?: string;
  icon_name: string;
  size_info: string;
  page_info: string;
  display_order: number;
  is_active: boolean;
}

const AdminPanel = () => {
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [editingResource, setEditingResource] = useState<FreeResource | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  const emptyResource: FreeResource = {
    title: '',
    type: 'PDF',
    description: '',
    features: [],
    download_url: '',
    icon_name: 'FileText',
    size_info: '',
    page_info: '',
    display_order: 0,
    is_active: true,
  };

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        window.location.href = '/';
        return;
      }

      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', user.id)
        .eq('role', 'admin')
        .single();

      if (error || !data) {
        window.location.href = '/';
        return;
      }

      setIsAdmin(true);
      fetchResources();
    } catch (error) {
      console.error('Error checking admin access:', error);
      window.location.href = '/';
    }
  };

  const fetchResources = async () => {
    try {
      const { data, error } = await supabase
        .from('free_resources')
        .select('*')
        .order('display_order');

      if (error) throw error;
      setResources((data || []) as FreeResource[]);
    } catch (error) {
      console.error('Error fetching resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (resource: FreeResource) => {
    try {
      if (resource.id) {
        // Update existing resource
        const { error } = await supabase
          .from('free_resources')
          .update({
            title: resource.title,
            type: resource.type,
            description: resource.description,
            features: resource.features,
            download_url: resource.download_url,
            icon_name: resource.icon_name,
            size_info: resource.size_info,
            page_info: resource.page_info,
            display_order: resource.display_order,
            is_active: resource.is_active,
          })
          .eq('id', resource.id);

        if (error) throw error;
      } else {
        // Create new resource
        const { error } = await supabase
          .from('free_resources')
          .insert([{
            title: resource.title,
            type: resource.type,
            description: resource.description,
            features: resource.features,
            download_url: resource.download_url,
            icon_name: resource.icon_name,
            size_info: resource.size_info,
            page_info: resource.page_info,
            display_order: resource.display_order,
            is_active: resource.is_active,
          }]);

        if (error) throw error;
      }

      fetchResources();
      setEditingResource(null);
      setIsCreating(false);
    } catch (error) {
      console.error('Error saving resource:', error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this resource?')) return;

    try {
      const { error } = await supabase
        .from('free_resources')
        .delete()
        .eq('id', id);

      if (error) throw error;
      fetchResources();
    } catch (error) {
      console.error('Error deleting resource:', error);
    }
  };

  const ResourceForm = ({ resource, onSave, onCancel }: {
    resource: FreeResource;
    onSave: (resource: FreeResource) => void;
    onCancel: () => void;
  }) => {
    const [formData, setFormData] = useState(resource);
    const [featuresText, setFeaturesText] = useState(resource.features.join('\n'));

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      onSave({
        ...formData,
        features: featuresText.split('\n').filter(f => f.trim()),
      });
    };

    return (
      <Card className="p-6 mb-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>
            <div>
              <Label htmlFor="type">Type</Label>
              <Select value={formData.type} onValueChange={(value: 'PDF' | 'VIDEO' | 'TOOL') => setFormData({ ...formData, type: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PDF">PDF</SelectItem>
                  <SelectItem value="VIDEO">Video</SelectItem>
                  <SelectItem value="TOOL">Tool</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
              required
            />
          </div>

          <div>
            <Label htmlFor="features">Features (one per line)</Label>
            <Textarea
              id="features"
              value={featuresText}
              onChange={(e) => setFeaturesText(e.target.value)}
              rows={4}
              placeholder="Feature 1&#10;Feature 2&#10;Feature 3"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="size_info">Size Info</Label>
              <Input
                id="size_info"
                value={formData.size_info}
                onChange={(e) => setFormData({ ...formData, size_info: e.target.value })}
                placeholder="4.2 MB"
                required
              />
            </div>
            <div>
              <Label htmlFor="page_info">Page Info</Label>
              <Input
                id="page_info"
                value={formData.page_info}
                onChange={(e) => setFormData({ ...formData, page_info: e.target.value })}
                placeholder="50 pages"
                required
              />
            </div>
            <div>
              <Label htmlFor="display_order">Display Order</Label>
              <Input
                id="display_order"
                type="number"
                value={formData.display_order}
                onChange={(e) => setFormData({ ...formData, display_order: parseInt(e.target.value) })}
                required
              />
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="download_url">Download URL</Label>
              <Input
                id="download_url"
                value={formData.download_url || ''}
                onChange={(e) => setFormData({ ...formData, download_url: e.target.value })}
                placeholder="https://..."
              />
            </div>
            <div>
              <Label htmlFor="icon_name">Icon Name</Label>
              <Select value={formData.icon_name} onValueChange={(value) => setFormData({ ...formData, icon_name: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FileText">FileText</SelectItem>
                  <SelectItem value="Video">Video</SelectItem>
                  <SelectItem value="Calculator">Calculator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="is_active"
              checked={formData.is_active}
              onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
            />
            <Label htmlFor="is_active">Active</Label>
          </div>

          <div className="flex space-x-2">
            <Button type="submit" className="btn-primary">
              <Save className="mr-2 w-4 h-4" />
              Save
            </Button>
            <Button type="button" onClick={onCancel} className="btn-ghost">
              <X className="mr-2 w-4 h-4" />
              Cancel
            </Button>
          </div>
        </form>
      </Card>
    );
  };

  if (!isAdmin || loading) {
    return (
      <div className="min-h-screen pt-24 flex items-center justify-center">
        <div className="text-white text-lg">
          {loading ? 'Loading...' : 'Access Denied'}
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen pt-24 pb-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-white mb-4">Admin Panel</h1>
            <p className="text-gray-100">Manage free resources</p>
          </div>

          <div className="mb-6">
            <Button 
              onClick={() => setIsCreating(true)}
              className="btn-primary"
              disabled={isCreating || editingResource !== null}
            >
              <Plus className="mr-2 w-4 h-4" />
              Add New Resource
            </Button>
          </div>

          {isCreating && (
            <ResourceForm
              resource={emptyResource}
              onSave={handleSave}
              onCancel={() => setIsCreating(false)}
            />
          )}

          {editingResource && (
            <ResourceForm
              resource={editingResource}
              onSave={handleSave}
              onCancel={() => setEditingResource(null)}
            />
          )}

          <div className="grid gap-4">
            {resources.map((resource) => (
              <Card key={resource.id} className="p-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-4 mb-2">
                      <h3 className="text-xl font-semibold text-white">{resource.title}</h3>
                      <span className="px-2 py-1 bg-primary/20 text-primary text-xs rounded">
                        {resource.type}
                      </span>
                      {!resource.is_active && (
                        <span className="px-2 py-1 bg-red-500/20 text-red-400 text-xs rounded">
                          Inactive
                        </span>
                      )}
                    </div>
                    <p className="text-gray-100 text-sm mb-2">{resource.description}</p>
                    <div className="text-xs text-gray-300">
                      Order: {resource.display_order} | Size: {resource.size_info} | {resource.page_info}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button
                      onClick={() => setEditingResource(resource)}
                      className="btn-ghost"
                      size="sm"
                      disabled={editingResource !== null || isCreating}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      onClick={() => handleDelete(resource.id!)}
                      className="btn-ghost text-red-400 hover:text-red-300"
                      size="sm"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;