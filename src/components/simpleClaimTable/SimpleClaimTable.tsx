import { IconButton, Typography } from "@material-ui/core";
import { makeStyles } from "@material-ui/core/styles";
import TableCell from "@material-ui/core/TableCell";
import TableRow from "@material-ui/core/TableRow";
import Tooltip from "@material-ui/core/Tooltip";
import CloseIcon from "@material-ui/icons/Close";
import React from "react";
import { useTranslation } from "react-i18next";
import { toast } from "react-toastify";
import { Skeleton1row1column } from "../../constantTemplates/SkeletonTable";
import axios from "../../utils/axios";
import LinkifyText from "../../utils/linkify";
import ConfirmationCancelAlert from "../confirmationCancelAlert";
import GenericTable from "../genericTable";
import { HelpTableData } from "../help/processHelpRequests";
import PassedTime from "../passedTime";
import { withUser } from "../userContext";
import { EContextValue } from "../userContext/UserContext";
import VideoCallButton from "../videoCallButton";

const useStyles = makeStyles({
  cell: {
    width: "50%",
  },
  timeCell: {
    minWidth: "2vh",
  },
  myRequestTime: {
    textAlign: "center",
  },
  comment: {
    textAlign: "left",
    marginTop: "5px",
    marginBottom: "5px",
  },
  b: {
    wordWrap: "break-word"
  }
});

interface SimpleClaimTableProps {
  helpRequests: HelpTableData[] | undefined;
}

function SimpleClaimTable(props: SimpleClaimTableProps & EContextValue) {
  const { t } = useTranslation();
  const [cancelAlertOpen, setOpen] = React.useState(false);
  const [cancelRequestId, setCancelRequestId] = React.useState<null | string>(
    null
  );

  const handleClickOpen = (id: string) => {
    setCancelRequestId(id);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const cancelRequest = async () => {
    if (cancelRequestId != null && cancelRequestId.toString().length > 0)
      try {
        const response = await axios.get(
          "/helpRequests/cancel/" + cancelRequestId.toString()
        );
        if (response.status === 200) {
          toast(t("SimpleClaimTable.toastRequestRemoved"), {
            type: "success",
          });
        }
      } catch (e) {}
    handleClose();
  };

  const classes = useStyles();
  const rows = (props as SimpleClaimTableProps).helpRequests;

  const head: JSX.Element = (
    <TableRow>
      <TableCell className={classes.cell} align="center">
        <Typography>{t("SimpleClaimTable.myRequests")}</Typography>
      </TableCell>
    </TableRow>
  );

  const body: JSX.Element | undefined = !rows ? undefined : (
    <>
      {rows?.map((row) => {
        const ownedByUser =
          props !== null &&
          row.submitters.some((u) => {
            return u.id.toString() === props?.user?.id.toString();
          });
        let rowData;
        if (ownedByUser) {
          rowData = (
            <TableRow key={row.id}>
              <TableCell
                align="right"
                className={classes.cell}
                style={{ verticalAlign: "middle" }}
              >
                <div className={classes.myRequestTime}>
                  {t("SimpleClaimTable.waitTime") + " "}
                  <PassedTime date={row.requestTime} />
                </div>
                
                <Typography className={classes.comment}>
                  <LinkifyText>{row.message}</LinkifyText>
                </Typography>
                <div>
                {props.course?.roomSetting?.localeCompare("PHYSICAL") !== 0 && row.physicalRoom === null ?
                  <><VideoCallButton id={row.zoomRoom} />
                  </>
                  : <div style={{marginTop: "10px", marginLeft: "15px", textAlign: "left"}}>{"Room: " + row.physicalRoom}</div>}
                  <Tooltip
                    title={t("SimpleClaimTable.cancelRequest") as string}
                  >
                    <IconButton
                      aria-label="cancel"
                      onClick={() => handleClickOpen(row.id)}
                    >
                      <CloseIcon style={{ fill: "#FF0000" }} />
                    </IconButton>
                  </Tooltip>
                </div>
              </TableCell>
            </TableRow>
          );
        }
        return rowData;
      })}
    </>
  );
  return (
    <>
      <GenericTable
        skeleton={<Skeleton1row1column />}
        head={head}
        body={body}
      />
      <ConfirmationCancelAlert
        open={cancelAlertOpen}
        handleClose={handleClose}
        cancelRequest={cancelRequest}
      />
    </>
  );
}

export default withUser()(SimpleClaimTable);
