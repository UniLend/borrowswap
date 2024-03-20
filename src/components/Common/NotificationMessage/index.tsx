import React, { memo } from "react";
import { notification } from "antd";
import { CheckCircleOutlined, CloseCircleOutlined } from "@ant-design/icons";
import "./index.scss";

interface NotificationMessageProps {
  result: "success" | "error";
  msg: string;
}

export default function NotificationMessage(
  result: "success" | "error",
  msg: string
) {
  return notification.open({
    message: result.substring(0, 1).toUpperCase() + result.substring(1),
    description: msg,
    className: "notification_class",
    closeIcon: false,
    duration: 5,
    icon:
      result == "success" ? (
        <CheckCircleOutlined style={{ color: "green" }} />
      ) : (
        <CloseCircleOutlined style={{ color: "red" }} />
      ),
  });
}

// const NotificationMessage: React.FC<NotificationMessageProps> = ({
//     result,
//     msg,
//   }: NotificationMessageProps) => {
//     notification.open({
//       message: result,
//       description: result === 'success' ? msg : msg,
//       className: 'notification_class',
//       closeIcon: false,
//       duration: 5,
//       icon: result === 'success' ? <CheckCircleOutlined /> : <CloseCircleOutlined />,
//     });

//     return null;
//   };

//   export default NotificationMessage;

NotificationMessage.defaultProps = {
  result: "success",
  msg: "Notification opened",
};
