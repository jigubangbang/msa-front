import { Link } from "react-router-dom";

export default function parseHashtags(content) {
    if (!content) return null;

    // Split by hashtags while keeping them
    return content.split(/(\#[\w가-힣]+)/g).map((part, index) => {
        if (part.startsWith("#")) {
            const tag = part.substring(1);
            return (
                <Link
                    key={index}
                    to={`/feed/search?tag=${encodeURIComponent(tag)}`}
                    className="text-blue-500 hover:underline"
                >
                    {part}
                </Link>
            );
        }
        return part;
    });
}