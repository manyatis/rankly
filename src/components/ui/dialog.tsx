import * as React from "react";

export interface DialogProps {
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  children: React.ReactNode;
}

const DialogContext = React.createContext<{ onOpenChange?: (open: boolean) => void }>({});

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  return (
    <DialogContext.Provider value={{ onOpenChange }}>
      <div className={`fixed inset-0 z-50 ${open ? 'block' : 'hidden'}`}>
        {children}
      </div>
    </DialogContext.Provider>
  );
}

export interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogContent = React.forwardRef<HTMLDivElement, DialogContentProps>(
  ({ className = "", children, ...props }, ref) => {
    const { onOpenChange } = React.useContext(DialogContext);

    const handleBackdropClick = (e: React.MouseEvent) => {
      if (e.target === e.currentTarget && onOpenChange) {
        onOpenChange(false);
      }
    };

    return (
      <>
        <div className="fixed inset-0 bg-black/50" />
        <div 
          className="fixed inset-0 flex items-center justify-center p-4"
          onClick={handleBackdropClick}
        >
          <div
            ref={ref}
            className={`relative w-full max-w-lg max-h-[90vh] overflow-auto bg-gray-900 border border-gray-700 rounded-lg shadow-lg ${className}`}
            onClick={(e) => e.stopPropagation()}
            {...props}
          >
            {children}
          </div>
        </div>
      </>
    );
  }
);
DialogContent.displayName = "DialogContent";

export interface DialogHeaderProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
}

export const DialogHeader = React.forwardRef<HTMLDivElement, DialogHeaderProps>(
  ({ className = "", ...props }, ref) => (
    <div
      ref={ref}
      className={`flex flex-col space-y-1.5 p-6 ${className}`}
      {...props}
    />
  )
);
DialogHeader.displayName = "DialogHeader";

export interface DialogTitleProps extends React.HTMLAttributes<HTMLHeadingElement> {
  children: React.ReactNode;
}

export const DialogTitle = React.forwardRef<HTMLHeadingElement, DialogTitleProps>(
  ({ className = "", ...props }, ref) => (
    <h3
      ref={ref}
      className={`text-lg font-semibold leading-none tracking-tight text-white ${className}`}
      {...props}
    />
  )
);
DialogTitle.displayName = "DialogTitle";

export interface DialogTriggerProps extends React.HTMLAttributes<HTMLElement> {
  asChild?: boolean;
  children: React.ReactNode;
}

export const DialogTrigger = React.forwardRef<HTMLElement, DialogTriggerProps>(
  ({ asChild, children, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, props);
    }
    
    return (
      <button {...props} ref={ref as React.Ref<HTMLButtonElement>}>
        {children}
      </button>
    );
  }
);
DialogTrigger.displayName = "DialogTrigger";