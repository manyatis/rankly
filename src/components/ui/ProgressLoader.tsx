interface ProgressLoaderProps {
  isLoading: boolean;
  progress: number;
  message: string;
  showPercentage?: boolean;
  subtitle?: string;
  className?: string;
}

export default function ProgressLoader({ 
  isLoading, 
  progress, 
  message, 
  showPercentage = true,
  subtitle,
  className = ""
}: ProgressLoaderProps) {
  if (!isLoading) return null;

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex justify-between items-center text-sm">
        <span className="text-gray-300">{message}</span>
        {showPercentage && (
          <span className="text-gray-400">{Math.round(progress)}%</span>
        )}
      </div>
      <div className="w-full bg-gray-700 rounded-full h-3">
        <div 
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-3 rounded-full transition-all duration-300 ease-out"
          style={{ width: `${progress}%` }}
        ></div>
      </div>
      {subtitle && (
        <div className="text-xs text-gray-400 text-center">
          {subtitle}
        </div>
      )}
    </div>
  );
}