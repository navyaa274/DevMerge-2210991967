import { useParams, useNavigate } from 'react-router-dom';
import ExamInterface from '../../components/ExamInterface';

export default function ExamPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    return (
        <div>
            <ExamInterface examId={id} />
        </div>
    );
}
