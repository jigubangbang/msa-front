import React from "react";

import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import StyleGuidePage from "../pages/temp/StyleGuidePage";
import TravelTypeTest from "../pages/temp/TravelTypeTest";
import TestPage from "../pages/temp/TestPage";

import Main from "../pages/main/Main";
import Profile from "../pages/profile/Profile";
import MapPage from "../pages/profile/MapPage";
import Countries from "../pages/profile/Countries";
import Badges from "../pages/profile/Badges";
import Diary from "../pages/profile/Diary";
import Bucketlist from "../pages/profile/Bucketlist";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Logout from "../components/common/Logout";
import SocialLoginHandler from "../pages/auth/SocialLoginHandler";

import ChatPanel from "../components/Chat/ChatPanel";
import QuestMainPage from "../pages/quest/quest-badge/QuestMainPage";
import QuestListPage from "../pages/quest/quest-badge/QuestListPage";
import BadgeListPage from "../pages/quest/quest-badge/BadgeListPage";
import RankListPage from "../pages/quest/quest-badge/RankListPage";

const AppRouter = () => {
    return (
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/style-guide" element={<StyleGuidePage/>}/>
          <Route path="/travel-test" element={<TravelTypeTest/>} />
          <Route path="/test-page" element={<TestPage/>}/>

          <Route path="/:userId/profile" element={<Profile/>}/>
          <Route path="/:userId/countries" element={<Countries/>}/>
          <Route path="/:userId/badges" element={<Badges/>}/>
          <Route path="/:userId/bucketlist" element={<Bucketlist/>}/>
          <Route path="/:userId/diary" element={<Diary/>}/>
          <Route path="/:userId/map" element={<MapPage/>}/>

          {/* Quest */}
          <Route path="/quest" element={<QuestMainPage/>}/>
          <Route path="/quest/list" element={<QuestListPage/>}/>
          <Route path="/quest/badge" element={<BadgeListPage/>}/>
          <Route path="/rank/list" element={<RankListPage/>}/>

          {/* Auth */}
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/> 
          <Route path="/oauth/kakao/callback" element={<SocialLoginHandler/>}/>
          <Route path="/oauth/naver/callback" element={<SocialLoginHandler/>}/>
          <Route path="/oauth/google/callback" element={<SocialLoginHandler/>}/>

          <Route path="/chat" element={<ChatPanel/>}/>
        </Routes>
    );
}

export default AppRouter;