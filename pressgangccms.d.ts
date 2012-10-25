import restler = module ("restler");
interface IPressGang {
    url?: string;
    username?: string;
    authtoken?: string;
    authmethod?: string;
    restver?: number;
    loglevel?: number;
}
export var DEFAULT_URL: string;
export var CONTENT_SPEC_TAG_ID: number;
export var REST_API_PATH: string;
export var DEFAULT_REST_VER: number;
export var DEFAULT_LOG_LEVEL: number;
export var DEFAULT_AUTH_METHOD: string;
export var DATA_REQ: { xml: string; topic_tags: string; json: string; };
export class PressGangCCMS implements IPressGang {
    public url: string;
    public username: string;
    public authtoken: string;
    public authmethod: string;
    public restver: number;
    public loglevel: number;
    constructor (settings: string);
    constructor (settings: IPressGang);
    public supportedDataRequests(): any;
    private log(msg: string, msglevel: number): void;
    public isContentSpec(topic_id: number, cb: (err: string,result: bool) => bool): any;
    public getTopicXML(topic_id: number, rev: number, cb: (err: string,result: any) => any): void;
    public getTopicData(data_request: string, topic_id: number, cb: (err: string,result: any) => any): any;
    public getTopicData(data_request: string, topic_id: number, rev: number, cb: (err: string,result: any) => any): any;
}
