import { useEffect, useState } from "react";
import FeedFilter from "../../components/feed/feed-filter/FeedFilter";
import FeedTemplate from "./FeedTemplate";
import styles from "./Feed.module.css";
import API_ENDPOINTS from "../../utils/constants";
import CommonFeed from "../../components/feed/CommonFeed";

export default function Feed() {
    const [filter, setFilter] = useState();
    const [endpoint, setEndpoint] = useState(`${API_ENDPOINTS.FEED.PUBLIC}/posts`);

    const handleFilterSubmit = () => {
        const params = new URLSearchParams();

        if (filter.countryId) params.append("countryId", filter.countryId);
        if (filter.cityId) params.append("cityId", filter.cityId);
        if (filter.startDate) params.append("startDate", filter.startDate.format("YYYY-MM-DD"));
        if (filter.endDate) params.append("endDate", filter.endDate.format("YYYY-MM-DD"));
        if (filter.sort) params.append("sort", filter.sort);
        console.log("filter country", filter.countryId);

        const url = `${API_ENDPOINTS.FEED.PUBLIC}/posts?${params.toString()}`;
        setEndpoint(url);
    }

    const handleResetClick = () => {
        setEndpoint(`${API_ENDPOINTS.FEED.PUBLIC}/posts`);
    }
    

    return (
        <FeedTemplate>
            <FeedFilter onSubmit={handleFilterSubmit} setFilter={setFilter} onReset={handleResetClick}/>
            <div className={styles.feedContainer}>
                <CommonFeed key={endpoint} endpoint={endpoint}/>
            </div>
        </FeedTemplate>
    );
}