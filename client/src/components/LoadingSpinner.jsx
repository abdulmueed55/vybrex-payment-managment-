export default function LoadingSpinner({ size = 'md', fullPage = false }) {
  const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };

  if (fullPage) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className={`spinner ${sizes[size]} border-2`} />
      </div>
    );
  }

  return <div className={`spinner ${sizes[size]} border-2`} />;
}
