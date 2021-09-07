import { articlesCommonData, articlesCommonMethod } from '../../../common/articles'

var objectInjectToPage = {
    useStore: true,
    data: {
        pageData: {
            pageType: "articles-I-liked"
        }
    },
}
Object.assign(objectInjectToPage, articlesCommonMethod)
Object.assign(objectInjectToPage.data.pageData, articlesCommonData)
Page(objectInjectToPage)