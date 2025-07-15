import FeedTemplate from "./FeedTemplate";
import styles from "./Feed.module.css";
import API_ENDPOINTS from "../../utils/constants";
import CommonFeed from "../../components/feed/CommonFeed";

export default function FeedFollowing() {
    const endpoint = `${API_ENDPOINTS.FEED.PRIVATE}/following`;
    return (
        <FeedTemplate>
            <div className={styles.feedContainer}>
                <CommonFeed endpoint={endpoint}/>
            </div>
        </FeedTemplate>
    );
}