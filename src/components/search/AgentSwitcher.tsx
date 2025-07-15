// import * as React from "react";
import { ChevronsUpDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Button } from "../botton";

export function AgentSwitcher({
  agents,
  activeAgentIndex,
  onSelectAgent,
}: {
  agents: { index: number; title: string; agentId: string }[];
  activeAgentIndex: number | null;
  onSelectAgent: (index: number) => void;
}) {
  const activeAgent = agents.find((a) => a.index === activeAgentIndex);

  if (!activeAgent) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="outline"
          className="flex items-center gap-2 px-4 py-2 rounded-lg"
        >
          <span className="font-medium">{activeAgent.title}</span>
          <ChevronsUpDown className="ml-2 h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="min-w-56 rounded-lg bg-white z-[100] border p-2 border-gray-200">
        <DropdownMenuLabel className="text-xs text-muted-foreground">
          Search Agents
        </DropdownMenuLabel>
        {agents.map((agent) => (
          <DropdownMenuItem
            key={agent.index}
            onClick={() => onSelectAgent(agent.index)}
            className="gap-2 p-2"
          >
            {agent.title}
          </DropdownMenuItem>
        ))}
        <DropdownMenuSeparator />
        {/* Optionally, add "Add agent" or similar here */}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
