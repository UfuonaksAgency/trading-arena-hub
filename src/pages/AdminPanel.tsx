import { useState, useEffect } from 'react';
import { Plus, Edit, Trash2, Save, X, Calendar, Download, BarChart3, BookOpen, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
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

interface Consultation {
  id: string;
  name: string;
  email: string;
  telegram?: string;
  preferred_time: string;
  experience_level: string;
  purpose: string;
  status: 'pending' | 'scheduled' | 'completed' | 'cancelled' | 'paid';
  calendly_event_uri?: string;
  calendly_invitee_uri?: string;
  scheduled_time?: string;
  payment_status: 'unpaid' | 'paid' | 'refunded';
  admin_notes?: string;
  created_at: string;
  updated_at: string;
}

interface DownloadStats {
  resource_id: string;
  resource_title: string;
  download_count: number;
  recent_downloads: number;
}

interface BlogPost {
  id?: string;
  title: string;
  slug: string;
  content: string;
  excerpt?: string;
  featured_image_url?: string;
  tags?: string[];
  reading_time?: number;
  seo_title?: string;
  seo_description?: string;
  is_published: boolean;
  is_featured: boolean;
  author_id: string;
  view_count?: number;
  published_at?: string;
  created_at?: string;
  updated_at?: string;
}

const AdminPanel = () => {
  const [resources, setResources] = useState<FreeResource[]>([]);
  const [consultations, setConsultations] = useState<Consultation[]>([]);
  const [downloadStats, setDownloadStats] = useState<DownloadStats[]>([]);
  const [blogPosts, setBlogPosts] = useState<BlogPost[]>([]);
  const [editingResource, setEditingResource] = useState<FreeResource | null>(null);
  const [editingConsultation, setEditingConsultation] = useState<Consultation | null>(null);
  const [editingBlogPost, setEditingBlogPost] = useState<BlogPost | null>(null);
  const [isCreating, setIsCreating] = useState(false);
  const [isCreatingBlog, setIsCreatingBlog] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeTab, setActiveTab] = useState('resources');

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

  const emptyBlogPost: BlogPost = {
    title: '',
    slug: '',
    content: '',
    excerpt: '',
    featured_image_url: '',
    tags: [],
    reading_time: 5,
    seo_title: '',
    seo_description: '',
    is_published: false,
    is_featured: false,
    author_id: '',
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
      fetchConsultations();
      fetchDownloadStats();
      // fetchBlogPosts(); // Will add after blog_posts table exists
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

  const fetchConsultations = async () => {
    try {
      const { data, error } = await supabase
        .from('consultations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setConsultations((data || []) as Consultation[]);
    } catch (error) {
      console.error('Error fetching consultations:', error);
    }
  };

  const fetchDownloadStats = async () => {
    try {
      const { data, error } = await supabase
        .from('resource_downloads')
        .select(`
          resource_id,
          free_resources!inner(title),
          downloaded_at
        `);

      if (error) throw error;

      // Process download statistics
      const statsMap = new Map<string, { title: string; total: number; recent: number }>();
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);

      data?.forEach((download: any) => {
        const resourceId = download.resource_id;
        const title = download.free_resources?.title || 'Unknown';
        const downloadDate = new Date(download.downloaded_at);
        
        if (!statsMap.has(resourceId)) {
          statsMap.set(resourceId, { title, total: 0, recent: 0 });
        }
        
        const stats = statsMap.get(resourceId)!;
        stats.total++;
        
        if (downloadDate > oneDayAgo) {
          stats.recent++;
        }
      });

      const statsArray = Array.from(statsMap.entries()).map(([resourceId, stats]) => ({
        resource_id: resourceId,
        resource_title: stats.title,
        download_count: stats.total,
        recent_downloads: stats.recent,
      }));

      setDownloadStats(statsArray);
    } catch (error) {
      console.error('Error fetching download stats:', error);
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

  const handleUpdateConsultation = async (consultationId: string, updates: Partial<Consultation>) => {
    try {
      const { error } = await supabase
        .from('consultations')
        .update(updates)
        .eq('id', consultationId);

      if (error) throw error;
      
      fetchConsultations();
      setEditingConsultation(null);
    } catch (error) {
      console.error('Error updating consultation:', error);
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

  const ConsultationCard = ({ consultation }: { consultation: Consultation }) => {
    const [notes, setNotes] = useState(consultation.admin_notes || '');
    const [status, setStatus] = useState(consultation.status);
    const [paymentStatus, setPaymentStatus] = useState(consultation.payment_status);

    const handleUpdate = () => {
      handleUpdateConsultation(consultation.id, {
        admin_notes: notes,
        status,
        payment_status: paymentStatus
      });
    };

    const getStatusColor = (status: string) => {
      switch (status) {
        case 'pending': return 'bg-yellow-500/20 text-yellow-400';
        case 'scheduled': return 'bg-blue-500/20 text-blue-400';
        case 'completed': return 'bg-green-500/20 text-green-400';
        case 'cancelled': return 'bg-red-500/20 text-red-400';
        case 'paid': return 'bg-purple-500/20 text-purple-400';
        default: return 'bg-gray-500/20 text-gray-400';
      }
    };

    return (
      <Card className="p-6 mb-4">
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">{consultation.name}</h3>
            <p className="text-gray-100 text-sm mb-1">{consultation.email}</p>
            {consultation.telegram && (
              <p className="text-gray-100 text-sm mb-2">Telegram: {consultation.telegram}</p>
            )}
            <div className="flex items-center space-x-2 mb-2">
              <span className={`px-2 py-1 text-xs rounded ${getStatusColor(consultation.status)}`}>
                {consultation.status}
              </span>
              <span className={`px-2 py-1 text-xs rounded ${
                consultation.payment_status === 'paid' ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-400'
              }`}>
                {consultation.payment_status}
              </span>
            </div>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Preferred Time:</strong> {consultation.preferred_time}
            </p>
            <p className="text-gray-300 text-sm mb-2">
              <strong>Experience:</strong> {consultation.experience_level}
            </p>
            <p className="text-gray-300 text-sm mb-4">
              <strong>Purpose:</strong> {consultation.purpose}
            </p>
            <p className="text-gray-400 text-xs">
              Submitted: {new Date(consultation.created_at).toLocaleDateString()}
            </p>
          </div>
          
          <div className="space-y-4">
            <div>
              <Label htmlFor={`status-${consultation.id}`} className="text-white">Status</Label>
              <Select value={status} onValueChange={(value: typeof status) => setStatus(value as typeof status)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`payment-${consultation.id}`} className="text-white">Payment Status</Label>
              <Select value={paymentStatus} onValueChange={(value: typeof paymentStatus) => setPaymentStatus(value as typeof paymentStatus)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="unpaid">Unpaid</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                  <SelectItem value="refunded">Refunded</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor={`notes-${consultation.id}`} className="text-white">Admin Notes</Label>
              <Textarea
                id={`notes-${consultation.id}`}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Add notes about this consultation..."
                rows={3}
              />
            </div>
            
            <Button onClick={handleUpdate} className="btn-primary w-full">
              <Save className="mr-2 w-4 h-4" />
              Update
            </Button>
          </div>
        </div>
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
            <p className="text-gray-100">Manage resources, consultations, and analytics</p>
          </div>

          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="resources" className="flex items-center">
                <Download className="mr-2 w-4 h-4" />
                Resources
              </TabsTrigger>
              <TabsTrigger value="blog" className="flex items-center">
                <BookOpen className="mr-2 w-4 h-4" />
                Blog
              </TabsTrigger>
              <TabsTrigger value="consultations" className="flex items-center">
                <Calendar className="mr-2 w-4 h-4" />
                Consultations
              </TabsTrigger>
              <TabsTrigger value="analytics" className="flex items-center">
                <BarChart3 className="mr-2 w-4 h-4" />
                Analytics
              </TabsTrigger>
            </TabsList>

            <TabsContent value="resources" className="mt-6">
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
                          {downloadStats.find(s => s.resource_id === resource.id) && (
                            <span className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded">
                              {downloadStats.find(s => s.resource_id === resource.id)?.download_count} downloads
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
            </TabsContent>

            <TabsContent value="blog" className="mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Blog Management</h2>
                <p className="text-gray-100 mb-4">Create and manage blog posts</p>
                <div className="bg-yellow-500/20 border border-yellow-500/30 rounded-lg p-4">
                  <p className="text-yellow-300 text-sm">
                    ⚠️ Blog functionality will be available after setting up the blog_posts table in the database.
                  </p>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="consultations" className="mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Consultation Requests</h2>
                <p className="text-gray-100">
                  Total: {consultations.length} | 
                  Pending: {consultations.filter(c => c.status === 'pending').length} | 
                  Scheduled: {consultations.filter(c => c.status === 'scheduled').length}
                </p>
              </div>

              {consultations.length === 0 ? (
                <Card className="p-8 text-center">
                  <p className="text-gray-100">No consultation requests yet.</p>
                </Card>
              ) : (
                <div>
                  {consultations.map((consultation) => (
                    <ConsultationCard key={consultation.id} consultation={consultation} />
                  ))}
                </div>
              )}
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">Download Analytics</h2>
                <p className="text-gray-100">Resource download statistics and trends</p>
              </div>

              <div className="grid gap-4">
                {downloadStats.map((stat) => (
                  <Card key={stat.resource_id} className="p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-white">{stat.resource_title}</h3>
                        <p className="text-gray-100 text-sm">
                          Total Downloads: {stat.download_count} | 
                          Last 24h: {stat.recent_downloads}
                        </p>
                      </div>
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary">{stat.download_count}</div>
                        <div className="text-sm text-gray-400">total downloads</div>
                      </div>
                    </div>
                  </Card>
                ))}
                
                {downloadStats.length === 0 && (
                  <Card className="p-8 text-center">
                    <p className="text-gray-100">No download data available yet.</p>
                  </Card>
                )}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AdminPanel;