/**
 * HazardWatch News API
 * Fetch disaster-related news from GNews
 */

const GNEWS_BASE_URL = "https://gnews.io/api/v4/search";
const API_KEY = "https://gnews.io/api/v4/search?q=disaster OR flood OR cyclone OR earthquake&lang=en&country=in&max=6&token=fdfb9e5b394271a3b276d5b9c8d0f00e"; // put your key here

export default async function handler(req, res) {

    try {

        if (!API_KEY) {
            return res.status(500).json({
                success: false,
                message: "Missing GNews API key"
            });
        }

        const query = encodeURIComponent(
            "disaster OR flood OR cyclone OR earthquake"
        );

        const url =
            `${GNEWS_BASE_URL}?q=${query}&lang=en&max=6&sortby=publishedAt&token=${API_KEY}`;

        const response = await fetch(url);
        const data = await response.json();

        if (!response.ok) {
            return res.status(response.status).json({
                success: false,
                message: data.errors || "Failed to fetch news"
            });
        }

        return res.status(200).json({
            success: true,
            articles: data.articles || [],
            totalArticles: data.totalArticles || 0
        });

    } catch (error) {

        console.error("News API Error:", error);

        return res.status(500).json({
            success: false,
            message: "Internal server error while fetching news"
        });

    }

}