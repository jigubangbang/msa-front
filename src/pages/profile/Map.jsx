import React, { forwardRef, useEffect, useImperativeHandle, useState } from "react";
import api from "../../apis/api";
import { ComposableMap, Geographies, Geography, Sphere, Graticule, ZoomableGroup, Annotation } from "react-simple-maps";
import geography from "../../../src/assets/features.json";
import styles from "./Map.module.css";
import API_ENDPOINTS from "../../utils/constants";
import { useNavigate, useParams } from "react-router-dom";

const Map = forwardRef((props, ref) => {
    const {userId} = useParams();

    const {
        sphereStrokeColor="#E4E5E6",
        sphereStrokeWidth=0.5,
        graticuleStrokeColor="#E4E5E6",
        graticuleStrokeWidth=0.5,
        geographyFill="#F3F3F3",
        geogrphyStrokeColor="#6b6b6b",
        geographyStrokeWidth=0.5,
        selectedCountry="",
        filledCountries=[],
        fillColor="#F3F3F3",
        isOwner=false
    } = props;
    const [mapColor, setMapColor] = useState(fillColor);
    const [tooltipContent, setTooltipContent] = useState("");
    const [tooltipPos, setTooltipPos] = useState({x: 0, y: 0}); 
    const [showTooltip, setShowTooltip] = useState(false); 

    const [showFeed, setShowFeed] = useState(false);
    const [posts, setPosts] = useState([]);
    const navigate = useNavigate();

    const [position, setPosition] = useState({coordinates: [0, 0], zoom: 1});
    useImperativeHandle(ref, () => ({
        zoomToCountry: (countryCoords) => {
            setPosition({coordinates: countryCoords, zoom: 4});
        }
    }));


    const handleCountryClick = async (id) => {
        if (!isOwner) return;
        try {
            const response = await api.get(`${API_ENDPOINTS.MYPAGE.PROFILE}/${userId}/countries/${id}`);
            setPosts(response.data.posts);
            setShowFeed(true);
        } catch (err) {
            console.error("Failed to fetch posts", err);
        }
    }


    useEffect(() => {
        api
            .get(`${API_ENDPOINTS.MYPAGE.PUBLIC}/${userId}/map/settings`)
            .then((response) => {
                switch (response.data.mapColor) {
                    case 'GREEN':
                        setMapColor("#93AD28");
                        break;
                    case 'PINK':
                        setMapColor("#FFB6C1");
                        break;
                    case 'YELLOW':
                        setMapColor("#F1DC81");
                        break;
                    default:
                        setMapColor("#83D9E0");
                }
            })
    }, [userId]);
    return (
        <div 
            className={styles.mapContainer}
            onMouseMove={(e) => {
                setTooltipPos({x: e.clientX + 10, y: e.clientY + 10});
            }}
        >
            <ComposableMap className={styles.map}
                projectionConfig={{
                rotate: [-10, 0, 0],
                scale: 147
            }}
            >
                <ZoomableGroup center={position.coordinates} zoom={position.zoom}>
                    <Sphere stroke={sphereStrokeColor} strokeWidth={sphereStrokeWidth}/>
                    <Graticule stroke={graticuleStrokeColor} strokeWidth={graticuleStrokeWidth}/>
                    <Geographies geography={geography}>
                        {({geographies}) => 
                            geographies.map((geo) => (
                                <Geography 
                                    key={geo.rsmKey}
                                    geography={geo}
                                    fill={filledCountries.includes(geo.id) ? mapColor : geographyFill}
                                    stroke={geogrphyStrokeColor}
                                    strokeWidth={geographyStrokeWidth}
                                    onMouseEnter={() => {
                                        const name = geo.properties.name;
                                        setTooltipContent(name);
                                        setShowTooltip(true);
                                    }}
                                    onMouseLeave={() => {
                                        setShowTooltip(false);
                                    }}
                                    onClick={() => handleCountryClick(geo.id)}
                                />
                            ))
                        }
                    </Geographies>
                    {selectedCountry.name && (
                        <Annotation
                            subject={position.coordinates}
                            dx={-30}
                            dy={-15}
                            connectorProps={{
                                stroke: "#999",
                                strokeWidth: 0.5
                            }}
                        >
                            <text x="-8" textAnchor="end" alignmentBaseline="middle" fill="#999" fontSize="7" fontFamily="Pixelify Sans">
                                {selectedCountry.name}
                            </text>
                        </Annotation>
                    )}
                </ZoomableGroup>
            </ComposableMap>

            {showTooltip && (
                <div className={styles.tooltip} style={{left: tooltipPos.x, top: tooltipPos.y}}>
                    {tooltipContent}
                </div>
            )}
            {showFeed && (
                <div className={styles.sidebar}>
                    <div className={styles.sidebarHeader}>
                        <h3>여행 기록</h3>
                        <button onClick={() => setShowFeed(false)} className={styles.closeButton}>✕</button>
                    </div>
                    {posts.length > 0 ? (
                        <div className={styles.postList}>
                            {posts.map((post) => (
                                <div key={post.id} className={styles.postCard} onClick={() => navigate(`/feed/${post.id}`)}>
                                    <img src={post.thumbnail} alt={post.title} className={styles.thumbnail}/>
                                    <div className={styles.postInfo}>
                                        <p className={styles.postTitle}>{post.title}</p>
                                        <p className={styles.postDate}>{post.createdAt?.slice(0,10)}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p className={styles.emptyMessage}>이 국가에 등록된 게시물이 없습니다.</p>
                    )}
                </div>
            )}
        </div>
    );
});

export default Map;