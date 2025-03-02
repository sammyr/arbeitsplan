interface LoadingSpinnerProps {
  fullHeight?: boolean;
}

export default function LoadingSpinner({ fullHeight = false }: LoadingSpinnerProps) {
  return (
    <div className={`flex justify-center items-center ${fullHeight ? 'h-screen' : 'h-full min-h-[400px]'}`}>
      {/* Ladeanimation entfernt, Container beibehalten */}
    </div>
  );
}
