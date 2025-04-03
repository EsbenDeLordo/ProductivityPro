import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Trash2, Plus, AlertCircle, CheckCircle2, MoreVertical, Edit, Check } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  category: ChecklistCategory;
  createdAt: Date;
}

interface ChecklistData {
  date: string;
  items: ChecklistItem[];
}

type ChecklistCategory = 'health' | 'work' | 'personal' | 'other';

// Default checklist based on Huberman recommendations
const DEFAULT_CHECKLIST_ITEMS: ChecklistItem[] = [
  {
    id: '1',
    text: 'Morning sunlight exposure (10-30 mins)',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '2',
    text: 'Take Omega-3 supplement',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '3',
    text: 'Drink 16oz water upon waking',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '4',
    text: 'Exercise/movement (30+ mins)',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '5',
    text: 'Cold exposure (2-5 mins)',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '6',
    text: 'Meditation/breathwork (10-20 mins)',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
  {
    id: '7',
    text: 'Complete 4 focus sessions',
    checked: false,
    category: 'work',
    createdAt: new Date(),
  },
  {
    id: '8',
    text: 'Review top 3 priorities for the day',
    checked: false,
    category: 'work',
    createdAt: new Date(),
  },
  {
    id: '9',
    text: 'No screens 1-2 hours before bed',
    checked: false,
    category: 'health',
    createdAt: new Date(),
  },
];

const CATEGORY_COLORS = {
  health: 'bg-green-500',
  work: 'bg-blue-500',
  personal: 'bg-purple-500',
  other: 'bg-gray-500',
};

export default function DailyChecklist() {
  const [checklist, setChecklist] = useState<ChecklistData>(() => {
    // Try to get from localStorage
    const saved = localStorage.getItem('dailyChecklist');
    if (saved) {
      const parsed = JSON.parse(saved) as ChecklistData;
      // Check if we need to reset for a new day
      const lastSaved = new Date(parsed.date);
      const today = new Date();
      
      if (
        lastSaved.getDate() !== today.getDate() ||
        lastSaved.getMonth() !== today.getMonth() ||
        lastSaved.getFullYear() !== today.getFullYear()
      ) {
        // New day, reset checks but keep items
        return {
          date: today.toISOString(),
          items: parsed.items.map((item: ChecklistItem) => ({ ...item, checked: false })),
        };
      }
      
      return parsed;
    }
    
    // First time initialization
    return {
      date: new Date().toISOString(),
      items: DEFAULT_CHECKLIST_ITEMS,
    };
  });
  
  const [newItemText, setNewItemText] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<ChecklistCategory>('health');
  const [isAddingItem, setIsAddingItem] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [editText, setEditText] = useState('');
  const { toast } = useToast();
  
  // Calculate progress
  const totalItems = checklist.items.length;
  const completedItems = checklist.items.filter(item => item.checked).length;
  const progress = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0;
  
  // Save to localStorage whenever checklist changes
  useEffect(() => {
    localStorage.setItem('dailyChecklist', JSON.stringify(checklist));
  }, [checklist]);
  
  const toggleItem = (id: string) => {
    setChecklist({
      ...checklist,
      items: checklist.items.map(item =>
        item.id === id ? { ...item, checked: !item.checked } : item
      ),
    });
  };
  
  const addItem = () => {
    if (!newItemText.trim()) return;
    
    const newItem: ChecklistItem = {
      id: Date.now().toString(),
      text: newItemText.trim(),
      checked: false,
      category: newItemCategory,
      createdAt: new Date(),
    };
    
    setChecklist({
      ...checklist,
      items: [...checklist.items, newItem],
    });
    
    setNewItemText('');
    setIsAddingItem(false);
    
    toast({
      title: 'Item added',
      description: 'New checklist item added successfully.',
    });
  };
  
  const deleteItem = (id: string) => {
    setChecklist({
      ...checklist,
      items: checklist.items.filter(item => item.id !== id),
    });
    
    toast({
      title: 'Item removed',
      description: 'Checklist item removed successfully.',
    });
  };
  
  const startEdit = (item: ChecklistItem) => {
    setEditingItem(item.id);
    setEditText(item.text);
  };
  
  const saveEdit = () => {
    if (!editText.trim() || !editingItem) return;
    
    setChecklist({
      ...checklist,
      items: checklist.items.map(item =>
        item.id === editingItem ? { ...item, text: editText.trim() } : item
      ),
    });
    
    setEditingItem(null);
    
    toast({
      title: 'Item updated',
      description: 'Checklist item updated successfully.',
    });
  };
  
  const resetChecklist = () => {
    setChecklist({
      date: new Date().toISOString(),
      items: checklist.items.map(item => ({ ...item, checked: false })),
    });
    
    toast({
      title: 'Checklist reset',
      description: 'All items have been unchecked.',
    });
  };
  
  // Group items by category
  const itemsByCategory = checklist.items.reduce<Record<ChecklistCategory, ChecklistItem[]>>((acc, item) => {
    if (!acc[item.category]) {
      acc[item.category] = [];
    }
    acc[item.category].push(item);
    return acc;
  }, { health: [], work: [], personal: [], other: [] });
  
  // Format the date header
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      weekday: 'long', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  return (
    <Card className="h-full">
      <CardHeader className="pb-3">
        <div className="flex justify-between items-center">
          <CardTitle className="text-xl">Daily Checklist</CardTitle>
          <Badge variant={progress === 100 ? "default" : "outline"} className="h-6">
            {completedItems}/{totalItems} • {progress}%
          </Badge>
        </div>
        <CardDescription>
          {formatDate(checklist.date)}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pb-0">
        <ScrollArea className="h-[340px] pr-4">
          {progress === 100 && (
            <div className="mb-4 p-3 rounded-md bg-green-50 border border-green-200 text-green-700 flex items-center dark:bg-green-950/30 dark:border-green-900 dark:text-green-400">
              <CheckCircle2 className="h-5 w-5 mr-2" />
              <span>Great job! You've completed all your tasks for today.</span>
            </div>
          )}
          
          {Object.entries(itemsByCategory).length > 0 ? (
            Object.entries(itemsByCategory).map(([category, items]) => (
              <div key={category} className="mb-4">
                <h3 className="text-sm font-medium mb-2 flex items-center">
                  <div 
                    className={`w-2 h-2 rounded-full mr-2 ${CATEGORY_COLORS[category as ChecklistCategory]}`}
                  />
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </h3>
                <ul className="space-y-2">
                  {items.map(item => (
                    <li 
                      key={item.id} 
                      className="flex items-start justify-between p-2 rounded-md hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-start gap-2">
                        <Checkbox 
                          id={`check-${item.id}`}
                          checked={item.checked} 
                          onCheckedChange={() => toggleItem(item.id)}
                          className="mt-0.5"
                        />
                        
                        {editingItem === item.id ? (
                          <div className="flex-1 flex items-center gap-2">
                            <Input
                              value={editText}
                              onChange={(e) => setEditText(e.target.value)}
                              className="h-8 min-w-[200px]"
                              autoFocus
                            />
                            <Button size="sm" variant="ghost" onClick={saveEdit} className="h-8 w-8 p-0">
                              <Check className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <label 
                            htmlFor={`check-${item.id}`}
                            className={`text-sm cursor-pointer ${
                              item.checked ? 'line-through text-muted-foreground' : ''
                            }`}
                          >
                            {item.text}
                          </label>
                        )}
                      </div>
                      
                      {editingItem !== item.id && (
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-8 w-8 p-0">
                              <MoreVertical className="h-4 w-4" />
                              <span className="sr-only">Actions</span>
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuLabel>Actions</DropdownMenuLabel>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem onClick={() => startEdit(item)}>
                              <Edit className="h-4 w-4 mr-2" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => deleteItem(item.id)} className="text-red-600 dark:text-red-400">
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      )}
                    </li>
                  ))}
                </ul>
              </div>
            ))
          ) : (
            <div className="text-center py-10 text-muted-foreground">
              <AlertCircle className="h-10 w-10 mx-auto mb-2 opacity-30" />
              <p>No items in your checklist yet.</p>
              <p className="text-sm">Add some tasks to get started.</p>
            </div>
          )}
          
          {isAddingItem && (
            <div className="mt-4 p-3 border rounded-md bg-muted/30">
              <h3 className="text-sm font-medium mb-2">Add New Item</h3>
              <div className="space-y-3">
                <Input
                  placeholder="Enter a new task..."
                  value={newItemText}
                  onChange={(e) => setNewItemText(e.target.value)}
                  className="w-full"
                  autoFocus
                />
                
                <div className="flex justify-between items-center">
                  <select
                    value={newItemCategory}
                    onChange={(e) => setNewItemCategory(e.target.value as ChecklistCategory)}
                    className="text-sm rounded-md border border-input bg-background px-3 py-1"
                  >
                    <option value="health">Health</option>
                    <option value="work">Work</option>
                    <option value="personal">Personal</option>
                    <option value="other">Other</option>
                  </select>
                  
                  <div className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => setIsAddingItem(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={addItem} disabled={!newItemText.trim()}>
                      Add Item
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </ScrollArea>
      </CardContent>
      
      <CardFooter className="pt-2 pb-3 flex justify-between">
        <Button 
          variant="ghost" 
          size="sm" 
          onClick={resetChecklist} 
          className="text-muted-foreground hover:text-foreground"
        >
          Reset
        </Button>
        
        {!isAddingItem && (
          <Button size="sm" onClick={() => setIsAddingItem(true)}>
            <Plus className="h-4 w-4 mr-1" />
            Add Task
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}