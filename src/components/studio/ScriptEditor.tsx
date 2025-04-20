import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Download } from "lucide-react";

export function ScriptEditor() {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Course Script</h3>
        <Button variant="outline" size="sm">
          <Download className="mr-2 h-4 w-4" />
          Save
        </Button>
      </div>
      <Textarea 
        className="min-h-[500px]"
        placeholder="Write your course script here..."
      />
    </div>
  );
}