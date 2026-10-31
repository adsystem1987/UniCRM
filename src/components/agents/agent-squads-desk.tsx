'use client';

import { useState } from 'react';
import { Bot, Check, Sparkles, ShieldCheck, Tag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AGENT_SQUAD_ROLES, type AgentSquadRole } from '@/lib/ai/squads';
import { toast } from 'sonner';

interface AgentSquadsDeskProps {
  currentPrompt: string;
  onApplyPrompt: (role: AgentSquadRole) => void;
}

export function AgentSquadsDesk({ currentPrompt, onApplyPrompt }: AgentSquadsDeskProps) {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const categories = [
    { id: 'all', label: 'All Roles' },
    { id: 'sales', label: 'Sales & Conversion' },
    { id: 'support', label: 'Support & Retention' },
    { id: 'operations', label: 'Operations & Retail' },
    { id: 'marketing', label: 'Community & Events' },
  ];

  const filteredRoles =
    selectedCategory === 'all'
      ? AGENT_SQUAD_ROLES
      : AGENT_SQUAD_ROLES.filter((r) => r.category === selectedCategory);

  const handleApply = (role: AgentSquadRole) => {
    setSelectedRole(role.id);
    onApplyPrompt(role);
    toast.success(`Loaded "${role.name}" playbook into AI Assistant configuration.`);
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-primary/20 bg-linear-to-br from-primary/10 via-primary/5 to-transparent p-5 sm:p-6 shadow-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex size-8 items-center justify-center rounded-xl bg-primary/20 text-primary">
            <Bot className="size-4.5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-foreground">
              Pre-Trained Agent Squads & Playbooks
            </h3>
            <p className="text-xs text-muted-foreground mt-0.5 max-w-xl">
              Equip your WhatsApp & Omnichannel AI Assistant with agency-grade personas. Select a role below to adopt its behavior and prompt instructions in 1 click.
            </p>
          </div>
        </div>

        {/* Category Tabs */}
        <div className="flex flex-wrap gap-1.5 mt-4 pt-3 border-t border-border/40">
          {categories.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                selectedCategory === cat.id
                  ? 'bg-primary text-primary-foreground shadow-xs'
                  : 'bg-muted/60 text-muted-foreground hover:text-foreground hover:bg-muted'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRoles.map((role) => {
          const isSelected = selectedRole === role.id;
          return (
            <div
              key={role.id}
              className={`rounded-2xl border p-5 flex flex-col justify-between transition-all ${
                isSelected
                  ? 'border-primary bg-primary/5 ring-1 ring-primary shadow-sm'
                  : 'border-border bg-card hover:border-border-strong hover:shadow-xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="text-sm font-bold text-foreground flex items-center gap-1.5">
                      {role.name}
                    </h4>
                    <span className="text-[11px] font-medium text-primary mt-0.5 inline-block">
                      {role.badge}
                    </span>
                  </div>
                  {isSelected && (
                    <Badge variant="default" className="text-[10px] gap-1 py-0 h-5">
                      <Check className="size-3" /> Active
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed">
                  {role.description}
                </p>

                <div className="rounded-lg bg-muted/60 p-2.5 text-[11px] text-muted-foreground border border-border/50">
                  <span className="font-semibold text-foreground block mb-0.5">Best For:</span>
                  {role.recommendedFor}
                </div>
              </div>

              <div className="mt-5 pt-4 border-t border-border flex items-center justify-between">
                <span className="text-[11px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3.5 text-emerald-500" />
                  Continuous Memory Ready
                </span>
                <Button
                  size="sm"
                  variant={isSelected ? 'secondary' : 'default'}
                  onClick={() => handleApply(role)}
                  className="text-xs h-8 gap-1 font-semibold"
                >
                  <Sparkles className="size-3" />
                  {isSelected ? 'Applied' : 'Adopt Role'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
