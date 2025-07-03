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
import Network from "../pages/profile/Network";

import Feed from "../components/feed/Feed";

import QuestMainPage from "../pages/quest/quest-badge/QuestMainPage";
import QuestListPage from "../pages/quest/quest-badge/QuestListPage";
import BadgeListPage from "../pages/quest/quest-badge/BadgeListPage";
import RankListPage from "../pages/quest/quest-badge/RankListPage";
import MyQuestPage from "../pages/quest/my-quest-badge/MyQuestPage";
import MyQuestBadgePage from "../pages/quest/my-quest-badge/MyQuestBadgePage";
import MyQuestRecordPage from "../pages/quest/my-quest-badge/MyQuestRecordPage";

import Register from "../pages/auth/Register";
import Login from "../pages/auth/Login";
import Logout from "../components/common/Logout";
import SocialLoginHandler from "../pages/auth/SocialLoginHandler";
import FindId from "../pages/auth/FindId";
import FindPassword from "../pages/auth/FindPassword";

import UserManage from "../pages/user/UserManage";
import UserInquiry from "../pages/user/UserInquiry";
import UserPremium from "../pages/user/UserPremium";
import UserWithdraw from "../pages/user/UserWithdraw";

import ChatPanel from "../pages/chat/ChatPanel";

const AppRouter = () => {
    return (
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/style-guide" element={<StyleGuidePage/>}/>
          <Route path="/travel-test" element={<TravelTypeTest/>} />
          <Route path="/test-page" element={<TestPage/>}/>

          {/* Profile */}
          <Route path="/profile/:userId" element={<Profile/>}/>
          <Route path="/profile/:userId/countries" element={<Countries/>}/>
          <Route path="/profile/:userId/badges" element={<Badges/>}/>
          <Route path="/profile/:userId/bucketlist" element={<Bucketlist/>}/>
          <Route path="/profile/:userId/diary" element={<Diary/>}/>
          <Route path="/profile/:userId/map" element={<MapPage/>}/>
          <Route path="/profile/:userId/following" element={<Network type="following"/>}/>
          <Route path="/profile/:userId/followers" element={<Network type="followers"/>}/>

          {/* Feed */}
          <Route path="/feed" element={<Feed/>}/>

          {/* Quest */}
          <Route path="/quest" element={<QuestMainPage/>}/>
          <Route path="/quest/list" element={<QuestListPage/>}/>
          <Route path="/quest/badge" element={<BadgeListPage/>}/>
          <Route path="/rank/list" element={<RankListPage/>}/>
          <Route path="/my-quest" element={<MyQuestPage/>}/>
          <Route path="/my-quest/badge" element={<MyQuestBadgePage/>}/>
          <Route path="/my-quest/record" element={<MyQuestRecordPage/>}/>

          {/* Auth */}
          <Route path="/register" element={<Register/>}/>
          <Route path="/login" element={<Login/>}/>
          <Route path="/logout" element={<Logout/>}/> 
          <Route path="/oauth/kakao/callback" element={<SocialLoginHandler/>}/>
          <Route path="/oauth/naver/callback" element={<SocialLoginHandler/>}/>
          <Route path="/oauth/google/callback" element={<SocialLoginHandler/>}/>
          <Route path="/find-id" element={<FindId/>}/>
          <Route path="/find-password" element={<FindPassword/>}/>

          {/* User */}
          <Route path="/user/manage" element={<UserManage/>}/>
          <Route path="/user/inquiry" element={<UserInquiry/>}/> 
          <Route path="/user/premium" element={<UserPremium/>}/> 
          <Route path="/user/withdraw" element={<UserWithdraw/>}/> 

          {/* Chat */}
          <Route path="/chat" element={<ChatPanel/>}/>
        </Routes>
    );
}

export default AppRouter;