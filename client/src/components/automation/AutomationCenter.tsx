import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  Clock, 
  Zap, 
  Calendar, 
  Mail, 
  FileText, 
  Upload, 
  Bell, 
  MessageSquare, 
  Loader2,
  Plus,
  Trash2,
  Save,
  ExternalLink,
  PlusCircle
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

// Automation workflow types
type TriggerType = 'time' | 'project' | 'calendar' | 'manual';
type ActionType = 'notification' | 'email' | 'report' | 'timer' | 'api';

interface Automation {
  id: string;
  name: string;
  description: string;
  trigger: {
    type: TriggerType;
    config: Record<string, any>;
  };
  actions: {
    type: ActionType;
    config: Record<string, any>;
  }[];
  enabled: boolean;
  createdAt: Date;
  lastRun?: Date;
}

// Sample automation templates
const AUTOMATION_TEMPLATES: Partial<Automation>[] = [
  {
    name: 'Daily Project Reminder',
    description: 'Send a notification at the start of your workday with active project tasks',
    trigger: {
      type: 'time',
      config: { time: '09:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
    },
    actions: [
      {
        type: 'notification',
        config: { title: 'Daily Project Update', body: 'Here are your active tasks for today' }
      }
    ]
  },
  {
    name: 'Work Session Summary',
    description: 'Generate a report of your work sessions at the end of each day',
    trigger: {
      type: 'time',
      config: { time: '17:00', days: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'] }
    },
    actions: [
      {
        type: 'report',
        config: { type: 'workSessions', format: 'summary', timeRange: 'today' }
      }
    ]
  },
  {
    name: 'Pomodoro Setup',
    description: 'Start a 25-minute focused work session with automatic breaks',
    trigger: {
      type: 'manual',
      config: {}
    },
    actions: [
      {
        type: 'timer',
        config: { duration: 25, breakDuration: 5, cycles: 4, longBreakDuration: 15 }
      }
    ]
  },
  {
    name: 'Weekly Progress Report',
    description: 'Receive a weekly summary of your productivity metrics',
    trigger: {
      type: 'time',
      config: { time: '16:00', days: ['Friday'] }
    },
    actions: [
      {
        type: 'report',
        config: { type: 'analytics', format: 'detailed', timeRange: 'week' }
      },
      {
        type: 'notification',
        config: { title: 'Weekly Report Ready', body: 'Your weekly productivity summary is ready to view' }
      }
    ]
  }
];

// Predefined automation components
const TriggerConfigs: Record<TriggerType, React.FC<{config: any, onChange: (config: any) => void}>> = {
  time: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Time</Label>
        <Input
          type="time"
          value={config.time || '09:00'}
          onChange={(e) => onChange({ ...config, time: e.target.value })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Repeat on days</Label>
        <div className="grid grid-cols-7 gap-1 mt-1">
          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, index) => {
            const fullDay = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'][index];
            const isSelected = config.days?.includes(fullDay);
            return (
              <Button
                key={day}
                type="button"
                variant={isSelected ? "default" : "outline"}
                size="sm"
                className="w-full h-8"
                onClick={() => {
                  const currentDays = config.days || [];
                  const updatedDays = isSelected
                    ? currentDays.filter((d: string) => d !== fullDay)
                    : [...currentDays, fullDay];
                  onChange({ ...config, days: updatedDays });
                }}
              >
                {day}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  ),
  project: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Project Event</Label>
        <Select 
          value={config.event || 'created'} 
          onValueChange={(value) => onChange({ ...config, event: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select an event" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="created">Project Created</SelectItem>
            <SelectItem value="updated">Project Updated</SelectItem>
            <SelectItem value="completed">Project Completed</SelectItem>
            <SelectItem value="deadline">Deadline Approaching</SelectItem>
          </SelectContent>
        </Select>
      </div>
      {config.event === 'deadline' && (
        <div>
          <Label>Days before deadline</Label>
          <Input
            type="number"
            min="1"
            max="14"
            value={config.daysBefore || 3}
            onChange={(e) => onChange({ ...config, daysBefore: parseInt(e.target.value) })}
            className="mt-1"
          />
        </div>
      )}
    </div>
  ),
  calendar: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Calendar Event Type</Label>
        <Select 
          value={config.eventType || 'meeting'} 
          onValueChange={(value) => onChange({ ...config, eventType: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select event type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="meeting">Meeting</SelectItem>
            <SelectItem value="deadline">Deadline</SelectItem>
            <SelectItem value="all">All Events</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Minutes before event</Label>
        <Input
          type="number"
          min="0"
          max="60"
          value={config.minutesBefore || 15}
          onChange={(e) => onChange({ ...config, minutesBefore: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>
    </div>
  ),
  manual: ({ config, onChange }) => (
    <div className="py-2">
      <p className="text-sm text-muted-foreground">
        This automation will be triggered manually by you from the dashboard or automation center.
      </p>
    </div>
  )
};

const ActionConfigs: Record<ActionType, React.FC<{config: any, onChange: (config: any) => void}>> = {
  notification: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Notification Title</Label>
        <Input
          value={config.title || ''}
          onChange={(e) => onChange({ ...config, title: e.target.value })}
          placeholder="Enter notification title"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Notification Body</Label>
        <Input
          value={config.body || ''}
          onChange={(e) => onChange({ ...config, body: e.target.value })}
          placeholder="Enter notification text"
          className="mt-1"
        />
      </div>
    </div>
  ),
  email: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Recipient</Label>
        <Input
          type="email"
          value={config.recipient || ''}
          onChange={(e) => onChange({ ...config, recipient: e.target.value })}
          placeholder="Enter email address"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Subject</Label>
        <Input
          value={config.subject || ''}
          onChange={(e) => onChange({ ...config, subject: e.target.value })}
          placeholder="Enter email subject"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Template</Label>
        <Select 
          value={config.template || 'productivity-report'} 
          onValueChange={(value) => onChange({ ...config, template: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select a template" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productivity-report">Productivity Report</SelectItem>
            <SelectItem value="work-summary">Work Session Summary</SelectItem>
            <SelectItem value="project-update">Project Update</SelectItem>
            <SelectItem value="custom">Custom Message</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  report: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Report Type</Label>
        <Select 
          value={config.type || 'analytics'} 
          onValueChange={(value) => onChange({ ...config, type: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select report type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="analytics">Productivity Analytics</SelectItem>
            <SelectItem value="workSessions">Work Sessions</SelectItem>
            <SelectItem value="projects">Project Progress</SelectItem>
            <SelectItem value="time">Time Allocation</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Format</Label>
        <Select 
          value={config.format || 'summary'} 
          onValueChange={(value) => onChange({ ...config, format: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select format" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="summary">Summary</SelectItem>
            <SelectItem value="detailed">Detailed</SelectItem>
            <SelectItem value="chart">Chart Visualization</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Time Range</Label>
        <Select 
          value={config.timeRange || 'today'} 
          onValueChange={(value) => onChange({ ...config, timeRange: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select time range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="today">Today</SelectItem>
            <SelectItem value="week">This Week</SelectItem>
            <SelectItem value="month">This Month</SelectItem>
            <SelectItem value="custom">Custom Range</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  ),
  timer: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>Focus Duration (minutes)</Label>
        <Input
          type="number"
          min="1"
          max="120"
          value={config.duration || 25}
          onChange={(e) => onChange({ ...config, duration: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Break Duration (minutes)</Label>
        <Input
          type="number"
          min="1"
          max="30"
          value={config.breakDuration || 5}
          onChange={(e) => onChange({ ...config, breakDuration: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Number of cycles</Label>
        <Input
          type="number"
          min="1"
          max="10"
          value={config.cycles || 4}
          onChange={(e) => onChange({ ...config, cycles: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>
      <div>
        <Label>Long Break Duration (after all cycles)</Label>
        <Input
          type="number"
          min="5"
          max="60"
          value={config.longBreakDuration || 15}
          onChange={(e) => onChange({ ...config, longBreakDuration: parseInt(e.target.value) })}
          className="mt-1"
        />
      </div>
    </div>
  ),
  api: ({ config, onChange }) => (
    <div className="space-y-3">
      <div>
        <Label>API Endpoint</Label>
        <Input
          value={config.endpoint || ''}
          onChange={(e) => onChange({ ...config, endpoint: e.target.value })}
          placeholder="https://api.example.com/webhook"
          className="mt-1"
        />
      </div>
      <div>
        <Label>Method</Label>
        <Select 
          value={config.method || 'POST'} 
          onValueChange={(value) => onChange({ ...config, method: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select HTTP method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="GET">GET</SelectItem>
            <SelectItem value="POST">POST</SelectItem>
            <SelectItem value="PUT">PUT</SelectItem>
            <SelectItem value="DELETE">DELETE</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div>
        <Label>Data to send</Label>
        <Select 
          value={config.dataType || 'productivity'} 
          onValueChange={(value) => onChange({ ...config, dataType: value })}
        >
          <SelectTrigger className="mt-1">
            <SelectValue placeholder="Select data to send" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="productivity">Productivity Stats</SelectItem>
            <SelectItem value="workSessions">Work Sessions</SelectItem>
            <SelectItem value="projects">Project Data</SelectItem>
            <SelectItem value="custom">Custom Payload</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  )
};

// Trigger and action icons for visual representation
const TriggerIcons: Record<TriggerType, React.ReactNode> = {
  time: <Clock className="h-4 w-4" />,
  project: <FileText className="h-4 w-4" />,
  calendar: <Calendar className="h-4 w-4" />,
  manual: <Zap className="h-4 w-4" />
};

const ActionIcons: Record<ActionType, React.ReactNode> = {
  notification: <Bell className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  report: <FileText className="h-4 w-4" />,
  timer: <Clock className="h-4 w-4" />,
  api: <ExternalLink className="h-4 w-4" />
};

// Helper functions for automation handling
const generateId = () => Math.random().toString(36).substr(2, 9);

const getInitialAutomations = (): Automation[] => {
  try {
    const saved = localStorage.getItem('automations');
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed.map((automation: any) => ({
        ...automation,
        createdAt: new Date(automation.createdAt),
        lastRun: automation.lastRun ? new Date(automation.lastRun) : undefined
      }));
    }
  } catch (error) {
    console.error('Error loading automations from localStorage:', error);
  }
  
  return [];
};

export function AutomationCenter() {
  const [activeTab, setActiveTab] = useState('my-automations');
  const [automations, setAutomations] = useState<Automation[]>(getInitialAutomations);
  const [isCreating, setIsCreating] = useState(false);
  const [isEditMode, setIsEditMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [currentAutomation, setCurrentAutomation] = useState<Automation | null>(null);
  const { toast } = useToast();

  // Save automations to localStorage
  const saveAutomations = (automations: Automation[]) => {
    localStorage.setItem('automations', JSON.stringify(automations));
    setAutomations(automations);
  };

  // Create a new automation
  const handleCreateAutomation = () => {
    const newAutomation: Automation = {
      id: generateId(),
      name: 'New Automation',
      description: 'Describe what this automation does',
      trigger: {
        type: 'manual',
        config: {}
      },
      actions: [
        {
          type: 'notification',
          config: { title: '', body: '' }
        }
      ],
      enabled: false,
      createdAt: new Date()
    };
    
    setCurrentAutomation(newAutomation);
    setIsCreating(true);
    setIsEditMode(true);
    setActiveTab('editor');
  };

  // Create from template
  const handleCreateFromTemplate = (template: Partial<Automation>) => {
    const newAutomation: Automation = {
      id: generateId(),
      name: template.name || 'New Automation',
      description: template.description || '',
      trigger: template.trigger || { type: 'manual', config: {} },
      actions: template.actions || [{ type: 'notification', config: { title: '', body: '' } }],
      enabled: false,
      createdAt: new Date()
    };
    
    setCurrentAutomation(newAutomation);
    setIsCreating(true);
    setIsEditMode(true);
    setActiveTab('editor');
  };

  // Edit an existing automation
  const handleEditAutomation = (automation: Automation) => {
    setCurrentAutomation(automation);
    setIsCreating(false);
    setIsEditMode(true);
    setActiveTab('editor');
  };

  // Delete an automation
  const handleDeleteAutomation = (id: string) => {
    const updatedAutomations = automations.filter(a => a.id !== id);
    saveAutomations(updatedAutomations);
    
    toast({
      title: 'Automation deleted',
      description: 'The automation has been removed from your list.',
    });
  };

  // Toggle automation enable/disable
  const handleToggleAutomation = (id: string, enabled: boolean) => {
    const updatedAutomations = automations.map(a => 
      a.id === id ? { ...a, enabled } : a
    );
    saveAutomations(updatedAutomations);
    
    toast({
      title: enabled ? 'Automation enabled' : 'Automation disabled',
      description: enabled 
        ? 'The automation will now run according to its trigger.' 
        : 'The automation has been paused.',
    });
  };

  // Update trigger configuration
  const handleUpdateTrigger = (type: TriggerType, config: any) => {
    if (!currentAutomation) return;
    setCurrentAutomation({
      ...currentAutomation,
      trigger: { type, config }
    });
  };

  // Update action configuration
  const handleUpdateAction = (index: number, type: ActionType, config: any) => {
    if (!currentAutomation) return;
    const updatedActions = [...currentAutomation.actions];
    updatedActions[index] = { type, config };
    setCurrentAutomation({
      ...currentAutomation,
      actions: updatedActions
    });
  };

  // Add a new action to the automation
  const handleAddAction = () => {
    if (!currentAutomation) return;
    setCurrentAutomation({
      ...currentAutomation,
      actions: [
        ...currentAutomation.actions,
        { type: 'notification', config: { title: '', body: '' } }
      ]
    });
  };

  // Remove an action from the automation
  const handleRemoveAction = (index: number) => {
    if (!currentAutomation) return;
    const updatedActions = [...currentAutomation.actions];
    updatedActions.splice(index, 1);
    setCurrentAutomation({
      ...currentAutomation,
      actions: updatedActions
    });
  };

  // Save the current automation
  const handleSaveAutomation = () => {
    if (!currentAutomation) return;
    
    setIsSaving(true);
    
    // Simulate an API call
    setTimeout(() => {
      let updatedAutomations;
      if (isCreating) {
        updatedAutomations = [...automations, currentAutomation];
      } else {
        updatedAutomations = automations.map(a => 
          a.id === currentAutomation.id ? currentAutomation : a
        );
      }
      
      saveAutomations(updatedAutomations);
      setIsSaving(false);
      setIsEditMode(false);
      setActiveTab('my-automations');
      
      toast({
        title: isCreating ? 'Automation created' : 'Automation updated',
        description: isCreating 
          ? 'Your new automation has been created successfully.' 
          : 'Your automation has been updated successfully.',
      });
    }, 800);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setIsEditMode(false);
    setIsCreating(false);
    setActiveTab('my-automations');
  };

  // Execute an automation manually
  const handleRunAutomation = (automation: Automation) => {
    // Update last run timestamp
    const updatedAutomations = automations.map(a => 
      a.id === automation.id ? { ...a, lastRun: new Date() } : a
    );
    saveAutomations(updatedAutomations);
    
    toast({
      title: 'Automation executed',
      description: `"${automation.name}" has been manually executed.`,
    });
  };

  // View an automation without editing
  const handleViewAutomation = (automation: Automation) => {
    setCurrentAutomation(automation);
    setIsCreating(false);
    setIsEditMode(false);
    setActiveTab('editor');
  };

  // Render the automation list
  const renderAutomationList = () => {
    if (automations.length === 0) {
      return (
        <div className="text-center py-10">
          <Zap className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <h3 className="text-lg font-medium mb-1">No automations yet</h3>
          <p className="text-muted-foreground mb-4">
            Create your first automation to save time and streamline your workflow.
          </p>
          <Button onClick={handleCreateAutomation}>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      );
    }
    
    return (
      <div className="space-y-3">
        {automations.map(automation => (
          <Card key={automation.id} className="overflow-hidden">
            <div className="bg-muted py-1 px-4 flex items-center justify-between border-b">
              <div className="flex items-center space-x-2">
                {TriggerIcons[automation.trigger.type]}
                <span className="text-xs font-medium">
                  {automation.trigger.type === 'time' ? 'Time-based' : 
                   automation.trigger.type === 'project' ? 'Project' :
                   automation.trigger.type === 'calendar' ? 'Calendar' : 'Manual'}
                </span>
              </div>
              <div className="flex items-center">
                <Switch 
                  checked={automation.enabled}
                  onCheckedChange={(checked) => handleToggleAutomation(automation.id, checked)}
                />
              </div>
            </div>
            
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start">
                <div>
                  <CardTitle className="text-lg">{automation.name}</CardTitle>
                  <CardDescription className="mt-1">{automation.description}</CardDescription>
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="pb-0">
              <div className="flex flex-wrap gap-2 mb-2">
                {automation.actions.map((action, index) => (
                  <Badge key={index} variant="outline" className="flex items-center space-x-1">
                    {ActionIcons[action.type]}
                    <span>
                      {action.type === 'notification' ? 'Notification' :
                       action.type === 'email' ? 'Email' :
                       action.type === 'report' ? 'Report' :
                       action.type === 'timer' ? 'Timer' : 'API Call'}
                    </span>
                  </Badge>
                ))}
              </div>
              
              {automation.lastRun && (
                <p className="text-xs text-muted-foreground">
                  Last run: {automation.lastRun.toLocaleString()}
                </p>
              )}
            </CardContent>
            
            <CardFooter className="flex justify-between pt-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={() => handleViewAutomation(automation)}
              >
                View Details
              </Button>
              
              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => handleEditAutomation(automation)}
                >
                  Edit
                </Button>
                <Button 
                  variant="default" 
                  size="sm"
                  disabled={!automation.enabled && automation.trigger.type !== 'manual'}
                  onClick={() => handleRunAutomation(automation)}
                >
                  Run Now
                </Button>
              </div>
            </CardFooter>
          </Card>
        ))}
      </div>
    );
  };

  // Render the automation editor
  const renderAutomationEditor = () => {
    if (!currentAutomation) {
      return (
        <div className="text-center py-10">
          <h3 className="text-lg font-medium mb-2">No automation selected</h3>
          <p className="text-muted-foreground mb-4">
            Please select an automation to view or edit, or create a new one.
          </p>
          <Button onClick={handleCreateAutomation}>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        </div>
      );
    }
    
    const TriggerConfig = TriggerConfigs[currentAutomation.trigger.type];
    
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold">
            {isCreating ? 'Create Automation' : isEditMode ? 'Edit Automation' : 'Automation Details'}
          </h2>
          
          {!isEditMode && (
            <div className="flex space-x-2">
              <Button
                variant="outline"
                onClick={() => handleEditAutomation(currentAutomation)}
              >
                Edit
              </Button>
              <Button
                variant="default"
                onClick={() => handleRunAutomation(currentAutomation)}
              >
                Run Now
              </Button>
            </div>
          )}
        </div>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="automation-name">Name</Label>
              <Input
                id="automation-name"
                value={currentAutomation.name}
                onChange={(e) => setCurrentAutomation({ ...currentAutomation, name: e.target.value })}
                disabled={!isEditMode}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="automation-description">Description</Label>
              <Input
                id="automation-description"
                value={currentAutomation.description}
                onChange={(e) => setCurrentAutomation({ ...currentAutomation, description: e.target.value })}
                disabled={!isEditMode}
                className="mt-1"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Label htmlFor="automation-enabled">Enabled</Label>
              <Switch
                id="automation-enabled"
                checked={currentAutomation.enabled}
                onCheckedChange={(checked) => setCurrentAutomation({ ...currentAutomation, enabled: checked })}
                disabled={!isEditMode}
              />
            </div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Trigger</CardTitle>
            <CardDescription>When should this automation run?</CardDescription>
          </CardHeader>
          <CardContent>
            {isEditMode ? (
              <div className="space-y-3">
                <div>
                  <Label>Trigger Type</Label>
                  <Select 
                    value={currentAutomation.trigger.type} 
                    onValueChange={(value: TriggerType) => handleUpdateTrigger(value, {})}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select trigger type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="time">Time-based</SelectItem>
                      <SelectItem value="project">Project Event</SelectItem>
                      <SelectItem value="calendar">Calendar Event</SelectItem>
                      <SelectItem value="manual">Manual Trigger</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <TriggerConfig 
                  config={currentAutomation.trigger.config} 
                  onChange={(config) => handleUpdateTrigger(currentAutomation.trigger.type, config)} 
                />
              </div>
            ) : (
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  {TriggerIcons[currentAutomation.trigger.type]}
                  <span className="font-medium">
                    {currentAutomation.trigger.type === 'time' ? 'Time-based' : 
                     currentAutomation.trigger.type === 'project' ? 'Project Event' :
                     currentAutomation.trigger.type === 'calendar' ? 'Calendar Event' : 'Manual Trigger'}
                  </span>
                </div>
                
                {currentAutomation.trigger.type === 'time' && (
                  <div className="pl-6 space-y-1">
                    <p className="text-sm">Time: {currentAutomation.trigger.config.time || '09:00'}</p>
                    <p className="text-sm">Days: {(currentAutomation.trigger.config.days || []).join(', ') || 'Every day'}</p>
                  </div>
                )}
                
                {currentAutomation.trigger.type === 'project' && (
                  <div className="pl-6 space-y-1">
                    <p className="text-sm">Event: {currentAutomation.trigger.config.event || 'Project Created'}</p>
                    {currentAutomation.trigger.config.event === 'deadline' && (
                      <p className="text-sm">Days before: {currentAutomation.trigger.config.daysBefore || 3}</p>
                    )}
                  </div>
                )}
                
                {currentAutomation.trigger.type === 'calendar' && (
                  <div className="pl-6 space-y-1">
                    <p className="text-sm">Event type: {currentAutomation.trigger.config.eventType || 'All Events'}</p>
                    <p className="text-sm">Minutes before: {currentAutomation.trigger.config.minutesBefore || 15}</p>
                  </div>
                )}
                
                {currentAutomation.trigger.type === 'manual' && (
                  <p className="pl-6 text-sm">This automation is triggered manually.</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <div>
              <CardTitle className="text-base">Actions</CardTitle>
              <CardDescription>What happens when the automation runs</CardDescription>
            </div>
            
            {isEditMode && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleAddAction}
                disabled={currentAutomation.actions.length >= 5}
              >
                <PlusCircle className="h-4 w-4 mr-1" />
                Add Action
              </Button>
            )}
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {currentAutomation.actions.map((action, index) => {
                const ActionConfig = ActionConfigs[action.type];
                
                return (
                  <Card key={index} className="border border-muted">
                    <CardHeader className="py-2 px-3 flex flex-row items-center justify-between space-y-0">
                      <div className="flex items-center space-x-2">
                        <Badge variant="secondary" className="text-xs">Action {index + 1}</Badge>
                        {isEditMode ? (
                          <Select 
                            value={action.type} 
                            onValueChange={(value: ActionType) => handleUpdateAction(index, value as ActionType, {})}
                          >
                            <SelectTrigger className="h-8 w-[180px]">
                              <SelectValue placeholder="Select action type" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="notification">Send Notification</SelectItem>
                              <SelectItem value="email">Send Email</SelectItem>
                              <SelectItem value="report">Generate Report</SelectItem>
                              <SelectItem value="timer">Set Timer</SelectItem>
                              <SelectItem value="api">API Call</SelectItem>
                            </SelectContent>
                          </Select>
                        ) : (
                          <div className="flex items-center space-x-1">
                            {ActionIcons[action.type]}
                            <span className="font-medium text-sm">
                              {action.type === 'notification' ? 'Send Notification' :
                               action.type === 'email' ? 'Send Email' :
                               action.type === 'report' ? 'Generate Report' :
                               action.type === 'timer' ? 'Set Timer' : 'API Call'}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {isEditMode && index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => handleRemoveAction(index)}
                        >
                          <Trash2 className="h-4 w-4 text-muted-foreground" />
                        </Button>
                      )}
                    </CardHeader>
                    <CardContent className="py-2 px-3">
                      {isEditMode ? (
                        <ActionConfig 
                          config={action.config} 
                          onChange={(config) => handleUpdateAction(index, action.type, config)} 
                        />
                      ) : (
                        <div className="text-sm">
                          {action.type === 'notification' && (
                            <>
                              <p><strong>Title:</strong> {action.config.title || 'No title'}</p>
                              <p><strong>Message:</strong> {action.config.body || 'No message'}</p>
                            </>
                          )}
                          
                          {action.type === 'email' && (
                            <>
                              <p><strong>To:</strong> {action.config.recipient || 'No recipient'}</p>
                              <p><strong>Subject:</strong> {action.config.subject || 'No subject'}</p>
                              <p><strong>Template:</strong> {action.config.template || 'Default'}</p>
                            </>
                          )}
                          
                          {action.type === 'report' && (
                            <>
                              <p><strong>Type:</strong> {action.config.type || 'Analytics'}</p>
                              <p><strong>Format:</strong> {action.config.format || 'Summary'}</p>
                              <p><strong>Time Range:</strong> {action.config.timeRange || 'Today'}</p>
                            </>
                          )}
                          
                          {action.type === 'timer' && (
                            <>
                              <p><strong>Duration:</strong> {action.config.duration || 25} minutes</p>
                              <p><strong>Break:</strong> {action.config.breakDuration || 5} minutes</p>
                              <p><strong>Cycles:</strong> {action.config.cycles || 4}</p>
                            </>
                          )}
                          
                          {action.type === 'api' && (
                            <>
                              <p><strong>Endpoint:</strong> {action.config.endpoint || 'No endpoint'}</p>
                              <p><strong>Method:</strong> {action.config.method || 'POST'}</p>
                              <p><strong>Data:</strong> {action.config.dataType || 'Productivity Stats'}</p>
                            </>
                          )}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </CardContent>
        </Card>
        
        {isEditMode && (
          <div className="flex justify-end space-x-2 pt-2">
            <Button variant="outline" onClick={handleCancelEdit}>
              Cancel
            </Button>
            <Button 
              onClick={handleSaveAutomation}
              disabled={isSaving || !currentAutomation.name.trim()}
            >
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isSaving ? 'Saving...' : 'Save Automation'}
            </Button>
          </div>
        )}
      </div>
    );
  };

  // Render automation templates
  const renderAutomationTemplates = () => {
    return (
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {AUTOMATION_TEMPLATES.map((template, index) => (
            <Card key={index} className="overflow-hidden">
              <div className="bg-muted py-1 px-4 flex items-center border-b">
                <div className="flex items-center space-x-2">
                  {TriggerIcons[template.trigger?.type || 'manual']}
                  <span className="text-xs font-medium">
                    {template.trigger?.type === 'time' ? 'Time-based' : 
                     template.trigger?.type === 'project' ? 'Project' :
                     template.trigger?.type === 'calendar' ? 'Calendar' : 'Manual'}
                  </span>
                </div>
              </div>
              
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <CardDescription className="mt-1">{template.description}</CardDescription>
              </CardHeader>
              
              <CardContent className="pb-0">
                <div className="flex flex-wrap gap-2 mb-2">
                  {template.actions?.map((action, i) => (
                    <Badge key={i} variant="outline" className="flex items-center space-x-1">
                      {ActionIcons[action.type]}
                      <span>
                        {action.type === 'notification' ? 'Notification' :
                         action.type === 'email' ? 'Email' :
                         action.type === 'report' ? 'Report' :
                         action.type === 'timer' ? 'Timer' : 'API Call'}
                      </span>
                    </Badge>
                  ))}
                </div>
              </CardContent>
              
              <CardFooter className="pt-2">
                <Button
                  variant="default"
                  className="w-full"
                  onClick={() => handleCreateFromTemplate(template)}
                >
                  Use This Template
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Task Automation Center</h1>
          <p className="text-muted-foreground">Create, manage, and run automations to streamline your workflow</p>
        </div>
        
        {!isEditMode && activeTab !== 'templates' && (
          <Button onClick={handleCreateAutomation}>
            <Plus className="h-4 w-4 mr-2" />
            Create Automation
          </Button>
        )}
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="my-automations" disabled={isEditMode}>
            My Automations
            {automations.length > 0 && (
              <Badge variant="secondary" className="ml-2">{automations.length}</Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="templates" disabled={isEditMode}>
            Templates
          </TabsTrigger>
          <TabsTrigger value="editor">
            {isCreating ? 'Create' : isEditMode ? 'Edit' : 'Details'}
          </TabsTrigger>
        </TabsList>
        
        <ScrollArea className="h-[calc(100vh-275px)]">
          <TabsContent value="my-automations" className="mt-0">
            {renderAutomationList()}
          </TabsContent>
          
          <TabsContent value="templates" className="mt-0">
            {renderAutomationTemplates()}
          </TabsContent>
          
          <TabsContent value="editor" className="mt-0">
            {renderAutomationEditor()}
          </TabsContent>
        </ScrollArea>
      </Tabs>
    </div>
  );
}