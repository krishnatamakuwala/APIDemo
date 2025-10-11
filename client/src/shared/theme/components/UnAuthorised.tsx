import { Box } from "@mui/material";
import Image from "next/image";
import { Fragment } from "react";

export default function UnAuthorised() {
    return (
        <Fragment>
            <Box display="flex" alignItems="center" justifyContent="center" width="100%" height="100%">
                <Image
                    width="250"
                    height="250"
                    // style={{ marginRight: 6 }}
                    src={"/default/unauthorised.jpg"}
                    alt={"UnAuthorised"}
                />
            </Box>
        </Fragment>
    )
}