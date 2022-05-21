import axios from "axios"

interface ComplimentrResponse {
  compliment: string
}

export const getCompliemnt = async () => {
  try {
    const response = await axios.get<ComplimentrResponse>('https://complimentr.com/api');
    return response.data.compliment  
  } catch (error) {
    console.error('failed to get compliemt')
  }
}