import { AxiosRequestConfig } from "axios";
import { SW_ACTION } from "../../shared/models/sw-urls.model";

export const SW_ISSUE_TIMBRE_DEV: SW_ACTION = {
    devUrl: "https://services.test.sw.com.mx/v3/cfdi33/issue/json/v4",
    prodUrl: "https://services.sw.com.mx/v3/cfdi33/issue/json/v4",
    contentType: "application/jsontoxml",
};
export const SW_GENERATE_PDF_DEV: SW_ACTION = {
    devUrl: "https://api.test.sw.com.mx/pdf/v1/api/GeneratePdf",
    prodUrl: "https://api.sw.com.mx/pdf/v1/api/GeneratePdf",
    contentType: "application/json",
};

export function createPostAxiosRequest(action: SW_ACTION, data: string): AxiosRequestConfig {
    return {
        method: "post",
        maxBodyLength: Infinity,
        url: action.devUrl,
        headers: {
            Authorization:
                process.env.SW_TOKEN_DEV,
            "Content-Type": action.contentType,
        },
        data: data,
    };
}


