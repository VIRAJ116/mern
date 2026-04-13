import { useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router';
import { useForm, Controller } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, Loader2, Save } from 'lucide-react';

import { cn } from '@/lib/utils';
import { getPizzaById, createPizza, updatePizza } from '@/services/pizza';
import { getCategories } from '@/services/category';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const TAG_OPTIONS = [
  { value: 'bestseller', label: 'Bestseller' },
  { value: 'popular', label: 'Popular' },
  { value: 'spicy', label: 'Spicy' },
  { value: 'chef-special', label: 'Chef Special' },
  { value: 'fusion', label: 'Fusion' },
  { value: 'premium', label: 'Premium' },
];

const pizzaSchema = z.object({
  name: z.string().nonempty('Name is required'),
  description: z.string().nonempty('Description is required'),
  category: z.string().nonempty('Category is required'),
  basePrice: z.coerce.number().min(0, 'Price must be 0 or more'),
  imageUrl: z.string().optional().default(''),
  tags: z.array(z.string()).optional().default([]),
});

export default function PizzaFormPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isEdit = Boolean(id);

  const { data: pizzaData, isLoading: isLoadingPizza } = useQuery({
    queryKey: ['pizza', id],
    queryFn: () => getPizzaById(id),
    enabled: isEdit,
  });

  const { data: categoriesData, isLoading: categoriesLoading } = useQuery({
    queryKey: ['categories'],
    queryFn: getCategories,
  });

  const categoriesList = categoriesData?.data ?? [];

  const pizza = pizzaData?.data || pizzaData;

  const {
    register,
    handleSubmit,
    control,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(pizzaSchema),
    defaultValues: {
      name: '',
      description: '',
      category: '',
      basePrice: '',
      imageUrl: '',
      tags: [],
    },
  });

  useEffect(() => {
    if (pizza && isEdit) {
      reset({
        name: pizza.name || '',
        description: pizza.description || '',
        category: pizza.category || '',
        basePrice: pizza.basePrice ?? pizza.price ?? '',
        imageUrl: pizza.imageUrl || '',
        tags: pizza.tags || [],
      });
    }
  }, [pizza, isEdit, reset]);

  const createMutation = useMutation({
    mutationFn: (data) => createPizza(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
      toast.success('Pizza created successfully');
      navigate('/pizzas');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to create pizza');
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data) => updatePizza(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pizzas'] });
      queryClient.invalidateQueries({ queryKey: ['pizza', id] });
      toast.success('Pizza updated successfully');
      navigate('/pizzas');
    },
    onError: (error) => {
      toast.error(error.response?.data?.message || 'Failed to update pizza');
    },
  });

  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  const onSubmit = (data) => {
    const payload = {
      ...data,
      price: data.basePrice,
    };
    delete payload.basePrice;

    if (isEdit) {
      updateMutation.mutate(payload);
    } else {
      createMutation.mutate(payload);
    }
  };

  if (isEdit && isLoadingPizza) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link to="/pizzas">
            <ArrowLeft className="h-5 w-5" />
          </Link>
        </Button>
        <div>
          <h1 className="text-2xl font-bold tracking-tight">
            {isEdit ? 'Edit Pizza' : 'Add Pizza'}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit ? 'Update pizza details' : 'Add a new pizza to the menu'}
          </p>
        </div>
      </div>

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Pizza Details</CardTitle>
          <CardDescription>
            Fill in the information below to {isEdit ? 'update' : 'create'} a pizza.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name">
                Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g. Margherita"
                disabled={isSubmitting}
                className={cn(errors.name && 'border-destructive focus-visible:ring-destructive')}
                {...register('name')}
              />
              {errors.name && (
                <p className="text-xs text-destructive">{errors.name.message}</p>
              )}
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description">
                Description <span className="text-destructive">*</span>
              </Label>
              <Textarea
                id="description"
                placeholder="Describe the pizza..."
                rows={3}
                disabled={isSubmitting}
                className={cn(
                  errors.description && 'border-destructive focus-visible:ring-destructive'
                )}
                {...register('description')}
              />
              {errors.description && (
                <p className="text-xs text-destructive">{errors.description.message}</p>
              )}
            </div>

            {/* Category and Price Row */}
            <div className="grid gap-6 sm:grid-cols-2">
              {/* Category */}
              <div className="space-y-2">
                <Label>
                  Category <span className="text-destructive">*</span>
                </Label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      key={field.value}
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={isSubmitting || categoriesLoading}
                    >
                      <SelectTrigger
                        className={cn(
                          errors.category && 'border-destructive focus-visible:ring-destructive'
                        )}
                      >
                        <SelectValue placeholder={categoriesLoading ? 'Loading...' : 'Select category'} />
                      </SelectTrigger>
                      <SelectContent>
                        {categoriesList.map((cat) => (
                          <SelectItem key={cat.id} value={cat.slug}>
                            {cat.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                />
                {errors.category && (
                  <p className="text-xs text-destructive">{errors.category.message}</p>
                )}
              </div>

              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="basePrice">
                  Base Price (INR) <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="basePrice"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 299"
                  disabled={isSubmitting}
                  className={cn(
                    errors.basePrice && 'border-destructive focus-visible:ring-destructive'
                  )}
                  {...register('basePrice')}
                />
                {errors.basePrice && (
                  <p className="text-xs text-destructive">{errors.basePrice.message}</p>
                )}
              </div>
            </div>

            {/* Image URL */}
            <div className="space-y-2">
              <Label htmlFor="imageUrl">Image URL</Label>
              <Input
                id="imageUrl"
                placeholder="https://example.com/pizza.jpg"
                disabled={isSubmitting}
                {...register('imageUrl')}
              />
              <p className="text-xs text-muted-foreground">
                Optional. Provide a URL to the pizza image.
              </p>
            </div>

            {/* Tags */}
            <div className="space-y-3">
              <Label>Tags</Label>
              <Controller
                name="tags"
                control={control}
                render={({ field }) => (
                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    {TAG_OPTIONS.map((tag) => {
                      const isChecked = field.value?.includes(tag.value);
                      return (
                        <label
                          key={tag.value}
                          className={cn(
                            'flex cursor-pointer items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors',
                            isChecked
                              ? 'border-primary/50 bg-primary/5'
                              : 'border-border hover:bg-accent/50'
                          )}
                        >
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              if (checked) {
                                field.onChange([...field.value, tag.value]);
                              } else {
                                field.onChange(field.value.filter((v) => v !== tag.value));
                              }
                            }}
                            disabled={isSubmitting}
                          />
                          {tag.label}
                        </label>
                      );
                    })}
                  </div>
                )}
              />
            </div>

            {/* Submit */}
            <div className="flex items-center gap-3 pt-2">
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {isEdit ? 'Updating...' : 'Creating...'}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    {isEdit ? 'Update Pizza' : 'Create Pizza'}
                  </>
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/pizzas')}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
