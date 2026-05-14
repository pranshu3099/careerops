import Card from "./card";
import { useApplications } from "@/context/applications-context";
import useApplicationStats from "@/hooks/use-application-stats";
import { getAllInterviews } from "@/lib/interviews";
import { Award, Briefcase, Calendar, CheckCircle2, XCircle } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

export default function SummaryCards() {
  const { applications } = useApplications();
  const {
    stats,
    isLoading: isStatsLoading,
    error: statsError,
    refetchApplicationStats,
  } = useApplicationStats({ autoFetch: true });
  const [scheduledInterviews, setScheduledInterviews] = useState(0);
  const [isInterviewsLoading, setIsInterviewsLoading] = useState(false);
  const [interviewsError, setInterviewsError] = useState("");
  const isMountedRef = useRef(false);
  const previousApplicationsCountRef = useRef(applications?.length || 0);

  const refetchInterviewSummary = useCallback(async () => {
    try {
      setIsInterviewsLoading(true);
      setInterviewsError("");
      const interviews = await getAllInterviews();
      const nextScheduledInterviews = (Array.isArray(interviews) ? interviews : []).filter(
        (interview) => interview?.status === "SCHEDULED",
      ).length;

      if (!isMountedRef.current) return nextScheduledInterviews;

      setScheduledInterviews(nextScheduledInterviews);
      return nextScheduledInterviews;
    } catch (err) {
      if (isMountedRef.current) {
        setInterviewsError(err?.message || "Failed to load interview summary");
      }
      return 0;
    } finally {
      if (isMountedRef.current) {
        setIsInterviewsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    isMountedRef.current = true;
    refetchInterviewSummary();

    return () => {
      isMountedRef.current = false;
    };
  }, [refetchInterviewSummary]);

  useEffect(() => {
    const applicationsCount = applications?.length || 0;
    if (previousApplicationsCountRef.current === applicationsCount) return;

    previousApplicationsCountRef.current = applicationsCount;
    refetchApplicationStats();
    refetchInterviewSummary();
  }, [applications?.length, refetchApplicationStats, refetchInterviewSummary]);

  const totalApplications = Object.values(stats || {}).reduce(
    (total, value) => total + (Number(value) || 0),
    0,
  );
  const isLoading = isStatsLoading || isInterviewsLoading;
  const summaryError = statsError || interviewsError;
  const cards = [
    {
      title: "Total Applications",
      value: totalApplications,
      icon: Briefcase,
      accent: "bg-blue-500",
      iconBg: "bg-blue-50",
      iconColor: "text-blue-500",
    },
    {
      title: "Interviews Scheduled",
      value: scheduledInterviews,
      icon: Calendar,
      accent: "bg-amber-400",
      iconBg: "bg-amber-50",
      iconColor: "text-amber-500",
    },
    {
      title: "Offers Received",
      value: stats?.offered || 0,
      icon: Award,
      accent: "bg-emerald-500",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-500",
    },
    {
      title: "Accepted",
      value: stats?.accepted || 0,
      icon: CheckCircle2,
      accent: "bg-emerald-600",
      iconBg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      title: "Offers Declined",
      value: stats?.offerDeclined || 0,
      icon: XCircle,
      accent: "bg-orange-400",
      iconBg: "bg-orange-50",
      iconColor: "text-orange-500",
    },
    {
      title: "Rejections",
      value: stats?.rejected || 0,
      icon: XCircle,
      accent: "bg-rose-400",
      iconBg: "bg-rose-50",
      iconColor: "text-rose-400",
    },
  ];

  return (
    <div className="grid grid-cols-2 gap-5 md:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card
            key={card.title}
            className="relative flex flex-col gap-4 overflow-hidden p-5"
          >
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${card.accent}`} />
 
            <div className="flex items-start justify-between">
              <div className={`p-2.5 rounded-xl ${card.iconBg}`}>
                <Icon className={`w-5 h-5 ${card.iconColor}`} />
              </div>
            </div>
 
            <div>
              <p className="text-3xl font-bold tracking-tight text-slate-800">
                {isLoading ? "..." : card.value}
              </p>
              <p className="mt-1 text-xs font-medium uppercase tracking-wider text-slate-400">
                {card.title}
              </p>
            </div>
 
            <div
              className={`text-xs font-medium ${
                summaryError ? "text-rose-500" : "text-slate-400"
              }`}
            >
              {summaryError ? "Unable to load summary" : "Live dashboard data"}
            </div>
          </Card>
        );
      })}
    </div>
  );
}
