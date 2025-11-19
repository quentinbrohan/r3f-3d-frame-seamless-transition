
interface LoaderProps {
    isLoading: boolean;
}

export const Loader: React.FC<LoaderProps> = ({ isLoading }) => {
    if (!isLoading) return;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black">
            <div className="text-white">Loading...</div>
        </div>
    )
}