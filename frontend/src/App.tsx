import { useState } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import RootHome from "./page/RootHome.tsx";
import RootDashboard from "./layout/root/RootDashboard.tsx";

import Test from "./page/Test.tsx";
import ContextProvider from "./context/ContextProvider.tsx";

import ProtectedRoute from "./layout/ProtectedRoute.tsx";

import RegisterEmployee from "./features/root/RegisterEmployee.tsx";
import ManageEmployee from "./features/root/ManageEmployee.tsx";
import EmployeeDashboard from "./layout/employee/EmployeeDashboard.tsx";
import EmployeeHome from "./page/EmployeeHome.tsx";
import JobListing from "./features/employee/JobListing.tsx";
import ManageJobListing from "./features/employee/ManageJobListing.tsx";
import Dashboard from "./features/employee/Dashboard.tsx";
import JobListingDetail from "./features/employee/JobListingDetail.tsx";
import HomeLayout from "./layout/applicant/HomeLayout.tsx";
import Home from "./page/Home.tsx";
import JobListingWall from "./features/applicant/JobListingWall.tsx";

import ApplicantLogin from "./page/ApplicantLogin.tsx";
import ApplicantSignup from "./page/ApplicantSignup.tsx";
import NewAccountGuard from "./layout/NewAccountGuard.tsx";
import ApplicantProfile from "./features/applicant/ApplicantProfile.tsx";

import CompleteAccountInformation from "./features/applicant/CompleteAccountInformation.tsx";
import SuccessfulApplication from "./components/common/SuccessfulApplication.tsx";
import Apply from "./features/applicant/Apply.tsx";
import MyJobs from "./layout/applicant/MyJobs.tsx";
import PendingJobs from "./features/applicant/Jobs/PendingJobs.tsx";
import { ApplicationLayout } from "./layout/employee/Applications/ApplicationLayout.tsx";
import ApplicationEvaluation from "./features/employee/Applications/ApplicationEvaluation.tsx";
import ApplicantInterview from "./features/employee/Applications/ApplicantInterview.tsx";
import ApplicantConversation from "./features/employee/Applications/ApplicantConversation.tsx";
import ApplicantConversations from "./features/applicant/Jobs/ApplicantConversations.tsx";
import ShortlistedJobs from "./features/applicant/Jobs/ShortlistedJobs.tsx";
import InterviewJobs from "./features/applicant/Jobs/InterviewJobs.tsx";
import ApplicationTracker from "./features/applicant/Jobs/ApplicationTracker.tsx";

function App() {
  return (
    <ContextProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/root" element={<RootHome />} />
          <Route path="/employee" element={<EmployeeHome />} />
          {/* ROOT */}
          <Route element={<ProtectedRoute path="/root" />}>
            <Route path="/root/dash" element={<RootDashboard />}>
              <Route path="manage_employee" element={<ManageEmployee />} />
              <Route path="register_employee" element={<RegisterEmployee />} />
            </Route>
          </Route>

          {/* EMPLOYEE */}
          <Route element={<ProtectedRoute path="/employee" />}>
            <Route path="/employee/dash" element={<EmployeeDashboard />}>
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="create_job_listing" element={<JobListing />} />
              <Route path="manage_job_listing" element={<ManageJobListing />} />
              <Route path="job_listing" element={<JobListingDetail />} />
              <Route path="job_listing/application" element={<ApplicationLayout />}>
                <Route path="evaluation" element={<ApplicationEvaluation/>}/>
                <Route path="interview" element={<ApplicantInterview/>}/>
                <Route path="conversation" element={<ApplicantConversation/>}/>
              </Route>
            </Route>
          </Route>

          {/* APPLICANT */}
          <Route path="/applicant" element={<HomeLayout />}>
            <Route path="" element={<Home />} />
            <Route path="job_wall" element={<JobListingWall />} />
            <Route path="conversations" element={<ApplicantConversations/>}/>
            <Route element={<ProtectedRoute path="/applicant/signin" />}>
              <Route element={<NewAccountGuard />}>
                <Route path="/applicant/my_jobs" element={<MyJobs />}>
                  <Route path="pending_jobs" element={<PendingJobs />} />
                  <Route path="shortlisted_jobs" element={<ShortlistedJobs />} />
                  <Route path="interview_jobs" element={<InterviewJobs />} />
                  <Route path="track_application" element={<ApplicationTracker />} />
                </Route>
              </Route>
            </Route>

            <Route element={<ProtectedRoute path="/applicant/signin" />}>
              <Route element={<NewAccountGuard />}>
                <Route path="profile" element={<ApplicantProfile />} />
              </Route>
            </Route>
            <Route
              path="/applicant/complete-account-info"
              element={<CompleteAccountInformation />}
            >d</Route>
          </Route>

          <Route element={<ProtectedRoute path="/applicant/signin" />}>
            <Route element={<NewAccountGuard />}>
              <Route path="/applicant/:job_id/apply" element={<Apply />} />
            </Route>
          </Route>

          <Route path="/applicant/signup" element={<ApplicantSignup />} />
          <Route path="/applicant/signin" element={<ApplicantLogin />} />

          <Route path="test" element={<Apply />} />
        </Routes>
      </BrowserRouter>
    </ContextProvider>
  );
}

export default App;
