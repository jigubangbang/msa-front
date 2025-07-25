import React from "react";
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

import StyleGuidePage from "../pages/temp/StyleGuidePage";
import TravelTypeTest from "../pages/feed/travel-style/TravelStyleTest";

import Main from "../pages/main/Main";
import Profile from "../pages/profile/Profile";
import MapPage from "../pages/profile/MapPage";
import Countries from "../pages/profile/Countries";
import Diary from "../pages/profile/Diary";
import Bucketlist from "../pages/profile/Bucketlist";
import Network from "../pages/profile/Network";

import Feed from "../pages/feed/Feed";

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
import InquiryMain from "../components/user/InquiryMain";
import InquiryForm from "../components/user/InquiryForm";
import InquiryDetail from "../components/user/InquiryDetail";
import UserPremium from "../pages/user/UserPremium";
import UserWithdraw from "../pages/user/UserWithdraw";

import AdminUser from "../pages/admin/AdminUser";
import AdminContent from "../pages/admin/AdminContent";
import PostManage from "../components/admin/PostManage";
import CommentManage from "../components/admin/CommentManage";
import GroupManage from "../components/admin/GroupManage";
import AdminReport from "../pages/admin/AdminReport";
import AdminInquiry from "../pages/admin/AdminInquiry";
import InquiryManage from "../components/admin/InquiryManage";
import InquiryReply from "../components/admin/InquiryReply";

import ChatPanel from "../pages/chat/ChatPanel";

import Payment from "../pages/payment/Payment";
import PaymentFail from "../pages/payment/PaymentFail";
import PaymentSuccess from "../pages/payment/PaymentSuccess";

import QuestAdminPage from "../pages/quest/quest-admin/QuestAdminPage";
import QuestAdminDetailPage from "../pages/quest/quest-admin/QuestAdminDetailPage";
import BadgeAdminDetailPage from "../pages/quest/quest-admin/BadgeAdminDetailPage";
import AdminFormPage from "../pages/quest/quest-admin/AdminFormPage";
import FeedDetail from "../components/feed/FeedDetail";
import TravelMateListPage from "../pages/community/traveler/travelmate/TravelMateListPage";
import FeedFollowing from "../pages/feed/FeedFollowing";
import FeedBookmark from "../pages/feed/FeedBookmark";
import FeedSearch from "../pages/feed/FeedSearch";
import FeedUserRecommendation from "../pages/feed/FeedUserRecommendation";
import TravelmateDetailPage from "../pages/community/traveler/travelmate/TravelmateDetailPage";
import TravelmateFormPage from "../pages/community/traveler/travelmate/TravelmateFormPage";
import InfoListPage from "../pages/community/traveler/travelinfo/InfoListPage";
import InfoFormPage from "../pages/community/traveler/travelinfo/InfoFormPage";
import BoardListPage from "../pages/community/board/BoardListPage";
import MyTravelerPage from "../pages/community/traveler/my/MyTravelerPage";
import TravelStyle from "../pages/feed/travel-style/TravelStyle";
import BoardDetailPage from "../pages/community/board/BoardDetailPage";
import BoardFormPage from "../pages/community/board/BoardFormPage";
import MyBoardPage from "../pages/community/board/MyBoardPage";
import PublicMapPage from "../pages/profile/PublicMapPage";

import About from '../pages/footer/About';
import Terms from '../pages/footer/Terms';
import Privacy from '../pages/footer/Privacy';
import Credits from '../pages/footer/Credits';

const AppRouter = () => {
    return (
        <Routes>
          <Route path="/" element={<Main/>} />
          <Route path="/style-guide" element={<StyleGuidePage/>}/>

          {/* Profile */}
          <Route path="/profile/:userId" element={<Profile/>}/>
          <Route path="/profile/:userId/countries" element={<Countries/>}/>
          <Route path="/profile/:userId/bucketlist" element={<Bucketlist/>}/>
          <Route path="/profile/:userId/diary" element={<Diary/>}/>
          <Route path="/profile/:userId/map" element={<MapPage/>}/>
          <Route path="/map/:userId" element={<PublicMapPage/>}/>
          <Route path="/profile/:userId/following" element={<Network type="following"/>}/>
          <Route path="/profile/:userId/followers" element={<Network type="followers"/>}/>

          {/* Feed */}
          <Route path="/feed" element={<Feed/>}/>
          <Route path="/feed/:feedId" element={<FeedDetail/>}/>
          <Route path="/feed/following" element={<FeedFollowing/>}/>
          <Route path="/feed/bookmark" element={<FeedBookmark/>}/>
          <Route path="/feed/search" element={<FeedSearch/>}/>
          <Route path="/feed/recommendation" element={<FeedUserRecommendation/>}/>
          <Route path="/feed/travel-style/:id" element={<TravelStyle/>}/>
          <Route path="/feed/travel-style-test" element={<TravelTypeTest/>}/>

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

          {/* 퀘스트 관리 */}
          <Route path="/quest-admin/quest" element={<QuestAdminPage page="quest"/>}/>
          <Route path="/quest-admin/quest/:questId" element={<QuestAdminDetailPage/>} />
          <Route path="/quest-admin/quest/new" element={<AdminFormPage />}/>
          <Route path="/quest-admin/quest/:id/modify" element={<AdminFormPage />}/>

          {/* 뱃지 관리 */}
          <Route path="/quest-admin/badge" element={<QuestAdminPage page="badge"/>}/>
          <Route path="/quest-admin/badge/:badgeId" element={<BadgeAdminDetailPage/>}/>
          <Route path="/quest-admin/badge/new" element={<AdminFormPage />}/>
          <Route path="/quest-admin/badge/:id/modify" element={<AdminFormPage />}/>

          {/* Traveler */}
          <Route path="/traveler/mate" element={<TravelMateListPage/>}/>
          <Route path="/traveler/mate/:postId" element={<TravelmateDetailPage/>}/>
          <Route path="/traveler/mate/new" element={<TravelmateFormPage/>}/>
          <Route path="/traveler/mate/:postId/edit" element={<TravelmateFormPage />} />
          
          <Route path="/traveler/info" element={<InfoListPage/>}/>
          <Route path="/traveler/info/new" element={<InfoFormPage/>}/>
          <Route path="/traveler/info/:infoId/edit" element={<InfoFormPage/>}/>
          <Route path="/traveler/my" element={<MyTravelerPage/>}/>
          <Route path="/traveler/my/travelinfo" element={<MyTravelerPage page="travelinfo"/>}/>
          <Route path="/traveler/my/travelmate" element={<MyTravelerPage page="travelmate"/>}/>

          {/*Board */}
          <Route path="/board/popular" element={<BoardListPage page="popular"/>}/>
          <Route path="/board/info" element={<BoardListPage page="info"/>}/>
          <Route path="/board/recommend" element={<BoardListPage page="recommend"/>}/>
          <Route path="/board/chat" element={<BoardListPage page="chat"/>}/>
          <Route path="/board/question" element={<BoardListPage page="question"/>}/>
          <Route path="/board/:postId" element={<BoardDetailPage/>}/>
          <Route path="/board/new" element={<BoardFormPage/>}/>
          <Route path="/board/:postId/edit" element={<BoardFormPage/>}/>
          <Route path="/board/my" element={<MyBoardPage/>}/>

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
          <Route path="/user/inquiry" element={<UserInquiry/>}>
            <Route index element={<InquiryMain/>}/>          
            <Route path="form" element={<InquiryForm/>}/>        
            <Route path=":id" element={<InquiryDetail/>}/>     
          </Route>
          <Route path="/user/premium" element={<UserPremium/>}/> 
          <Route path="/user/withdraw" element={<UserWithdraw/>}/> 

          {/* Admin */}
          <Route path="/admin/users" element={<AdminUser/>}/>
          <Route path="/admin/content" element={<AdminContent/>}>
            <Route path="posts" element={<PostManage/>}/>
            <Route path="comments" element={<CommentManage/>}/>
            <Route path="groups" element={<GroupManage/>}/>
          </Route>
          <Route path="/admin/reports" element={<AdminReport/>}/>
          <Route path="/admin/inquiries" element={<AdminInquiry/>}>
            <Route index element={<InquiryManage/>}/>
            <Route path=":id" element={<InquiryReply/>}/>
          </Route>

          {/* Chat */}
          <Route path="/chat" element={<ChatPanel/>}/>

          {/* Payment */}
          <Route path="/payment" element={<Payment />} />
          <Route path="/payment/fail" element={<PaymentFail />} />
          <Route path="/payment/success" element={<PaymentSuccess />} />

          {/* Footer */}
          <Route path="/about" element={<About/>}/>
          <Route path="/terms" element={<Terms/>}/>
          <Route path="/privacy" element={<Privacy/>}/>
          <Route path="/credits" element={<Credits/>}/>
        </Routes>
    );
}

export default AppRouter;