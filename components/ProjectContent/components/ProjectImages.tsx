export const ProjectImages = ({ images, projectName }: { images: string[]; projectName: string; }) => (
    <section className="grid grid-cols-12 gap-4 sm:gap-6 mt-12 sm:mt-16 mb-20 sm:mb-32 px-4 sm:px-8" aria-label={`${projectName} images`}>
        <div className="col-span-12">
            <div className="mb-8 overflow-hidden">
                <img
                    data-image-item
                    src={images[0]}
                    alt={`${projectName} - Main artwork view`}
                    className="w-full h-full object-cover" />
            </div>
        </div>

        <div className="col-span-12 sm:col-span-10 sm:col-start-2 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-8">
            {images.slice(-2).map((src, index) => (
                <div key={src} className="aspect-[3/4] overflow-hidden">
                    <img
                        src={src}
                        alt={`${projectName} - Detail view ${index + 1}`}
                        className="w-full h-full object-cover" />
                </div>
            ))}
        </div>
    </section>
);
