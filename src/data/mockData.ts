export interface IDType {
    id: string;
    title: string;
    size: string; // e.g. "295x413px"
    width: number;
    height: number;
    category: 'common' | 'exam' | 'visa';
    isHot?: boolean;
}

export const idTypes: IDType[] = [
    // 常用标准
    { id: '1', title: '一寸', size: '25x35mm | 295x413px', width: 295, height: 413, category: 'common', isHot: true },
    { id: '2', title: '二寸', size: '35x49mm | 413x579px', width: 413, height: 579, category: 'common', isHot: true },
    { id: '3', title: '大一寸', size: '33x48mm | 390x567px', width: 390, height: 567, category: 'common' },
    { id: '4', title: '小二寸', size: '35x45mm | 413x531px', width: 413, height: 531, category: 'common' },

    // 公务/考试
    { id: '5', title: '公务员/社保', size: '35x45mm | 413x531px', width: 413, height: 531, category: 'exam', isHot: true },
    { id: '6', title: '教师资格证', size: '295x413px', width: 295, height: 413, category: 'exam' },
    { id: '7', title: '身份证(扫描)', size: '26x32mm | 358x441px', width: 358, height: 441, category: 'exam' },
    { id: '8', title: '驾驶证', size: '22x32mm | 260x378px', width: 260, height: 378, category: 'exam' },
    { id: '9', title: '英语四六级', size: '33x48mm | 144x192px', width: 144, height: 192, category: 'exam' },

    // 各国签证
    { id: '10', title: '美国签证', size: '51x51mm | 600x600px', width: 600, height: 600, category: 'visa' },
    { id: '11', title: '日本签证', size: '45x45mm | 531x531px', width: 531, height: 531, category: 'visa' },
    { id: '12', title: '韩国签证', size: '35x45mm | 413x531px', width: 413, height: 531, category: 'visa' },
    { id: '13', title: '申根/欧洲签证', size: '35x45mm | 413x531px', width: 413, height: 531, category: 'visa' },
];

export const appStrings = {
    appName: "智能证件照",
    heroTitle: "拍摄全新证件照",
    heroSubtitle: "拍摄上传照片，自动制作标准证件照",
    searchPlaceholder: "输入想要的尺寸",
};
