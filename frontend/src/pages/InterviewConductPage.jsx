import { useParams } from "react-router-dom";
import ConductInterviewForm from "../components/ConductInterviewForm";

export default function InterviewConductPage() {
  const { sessionId } = useParams();

  return (
    <div className="">
      <ConductInterviewForm
        sessionId={sessionId}
        onSuccess={() => alert("Interview submitted successfully!")}
      />
    </div>
  );
}
