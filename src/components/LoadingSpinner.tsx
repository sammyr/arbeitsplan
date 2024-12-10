interface LoadingSpinnerProps {
  fullHeight?: boolean;
}

export default function LoadingSpinner({ fullHeight = false }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center ${fullHeight ? 'h-screen' : 'h-full min-h-[400px]'}`}>
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
    </div>
  );
}
