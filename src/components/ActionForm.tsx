import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Save, Plus } from "lucide-react";

interface FormShellProps {
  title: string;
  type: "add" | "edit";
  loading?: boolean;
  onSubmit: (e: React.FormEvent) => void;
  onClose?: () => void;
  children: React.ReactNode;
} 

export const FormShell = ({
  title,
  type,
  loading,
  onSubmit,
  onClose,
  children,
}: FormShellProps) => {
  const [open, setOpen] = React.useState(true);

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen);
    if (!nextOpen) onClose?.();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-4xl overflow-y-auto border-black bg-white">
        <DialogHeader className="border-b border-black pb-4">
          <DialogTitle className="text-lg font-bold text-primary">
          {type === "add" ? `Add New ${title}` : `Edit ${title}`}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {children}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-black">
            <Button type="button" variant="outline" className="border-black text-black hover:bg-[#004aaa]/10 hover:text-black" onClick={() => handleOpenChange(false)}>
              Close
            </Button>
            <Button type="submit" loading={loading} className="px-8 bg-primary text-white hover:bg-primary/90 hover:text-white active:bg-primary active:text-white focus-visible:text-white">
              {type === "add" ? (
                <Plus size={16} className="mr-2" />
              ) : (
                <Save size={16} className="mr-2" />
              )}
              {type === "add" ? "Create" : "Save Changes"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
