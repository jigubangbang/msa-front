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

import QuestMainPage from "../pages/quest/quest-badge/QuestMainPage";
import QuestListPage from "../pages/quest/quest-badge/QuestListPage";
import BadgeListPage from "../pages/quest/quest-badge/BadgeListPage";
import RankListPage from "../pages/quest/quest-badge/RankListPage";
import MyQuestPage from "../pages/quest/my-quest-badge/MyQuestPage";

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
import QuestAdminPage from "../pages/quest/quest-admin/QuestAdminPage";
import QuestAdminDetailPage from "../pages/quest/quest-admin/QuestAdminDetailPage";

const AppRouter = () => {
    return (
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/style-guide" element={<StyleGuidePage/>}/>
          <Route path="/travel-test" element={<TravelTypeTest/>} />
          <Route path="/test-page" element={<TestPage/>}/>

          <Route path="/profile/:userId/main" element={<Profile/>}/>
          <Route path="/profile/:userId/countries" element={<Countries/>}/>
          <Route path="/profile/:userId/badges" element={<Badges/>}/>
          <Route path="/profile/:userId/bucketlist" element={<Bucketlist/>}/>
          <Route path="/profile/:userId/diary" element={<Diary/>}/>
          <Route path="/profile/:userId/map" element={<MapPage/>}/>

          {/* Quest */}
          <Route path="/quest" element={<QuestMainPage/>}/>
          <Route path="/quest/list" element={<QuestListPage/>}/>
          <Route path="/quest/badge" element={<BadgeListPage/>}/>
          <Route path="/rank/list" element={<RankListPage/>}/>
          
          {/* My Quest - 본인 */}
          <Route path="/my-quest" element={<MyQuestPage page="main" isMine={true}/>}/>
          <Route path="/my-quest/badge" element={<MyQuestPage page="badge" isMine={true}/>}/>
          <Route path="/my-quest/record" element={<MyQuestPage page="record" isMine={true}/>}/>

          {/* My Quest - 다른 사용자 프로필 */}
          <Route path="/my-quest/profile/:userId" element={<MyQuestPage page="main" isMine={false}/>}/>
          <Route path="/my-quest/profile/:userId/badges" element={<MyQuestPage page="badge" isMine={false}/>}/>
          <Route path="/my-quest/profile/:userId/record" element={<MyQuestPage page="record" isMine={false}/>}/>

          {/* Admin Quest */}
          <Route path="/quest-admin/quest" element={<QuestAdminPage page="quest"/>}/>
          <Route path="/quest-admin/quest/:questId" element={<QuestAdminDetailPage />} />
          <Route path="/quest-admin/badge" element={<QuestAdminPage page="badge"/>}/>
          

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