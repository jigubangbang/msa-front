import { useEffect, useState } from "react";
import FeedTemplate from "./FeedTemplate";
import CommonFeed from "../../components/feed/CommonFeed";
import API_ENDPOINTS from "../../utils/constants";
import styles from "./Feed.module.css";

export default function FeedBookmark() {
    const endpoint = `${API_ENDPOINTS.FEED.PRIVATE}/bookmark`;
    return (
        <FeedTemplate>
            <div className={styles.feedContainer}>
                <CommonFeed endpoint={endpoint}/>
            </div>
        </FeedTemplate>
    );
}