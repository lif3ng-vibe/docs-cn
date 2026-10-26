# 自定义定价（SageMaker 与 Azure 等）

为 SageMaker 补全模型注册自定义定价。

对于对话、补全、嵌入与 responses 模型，可设置 `cost_per_second`。LiteLLM 会用该值乘以完整请求时长（包括流式输出直到收到最后一个分块）；若已配置按 Token 计价，则该参数会被忽略。

对于对话、补全、嵌入与 responses 接口，`input_cost_per_second` 和 `output_cost_per_second` 仍作为旧版别名被接受。`cost_per_second` 优先级最高，其次是 `input_cost_per_second`，再次是 `output_cost_per_second`；最终采用的费率只收取一次，不会叠加。语音转写、语音与视频场景则继续使用 `input_cost_per_second` 和 `output_cost_per_second`。

`cost_per_second` 需要 v1.105.0 及以上版本；更早的版本请使用 `input_cost_per_second`。

```python
# !uv add boto3 
from litellm import completion, completion_cost 

os.environ["AWS_ACCESS_KEY_ID"] = ""
os.environ["AWS_SECRET_ACCESS_KEY"] = ""
os.environ["AWS_REGION_NAME"] = ""


def test_completion_sagemaker():
    try:
        print("testing sagemaker")
        response = completion(
            model="sagemaker/berri-benchmarking-Llama-2-70b-chat-hf-4",
            messages=[{"role": "user", "content": "Hey, how's it going?"}],
            cost_per_second=0.000420,
        )
        # Add any assertions here to check the response
        print(response)
        cost = completion_cost(completion_response=response)
        print(cost)
    except Exception as e:
        raise Exception(f"Error occurred: {e}")

```


## 按 Token 计价（以 Azure 为例）


```python
# !uv add boto3 
from litellm import completion, completion_cost 

## set ENV variables
os.environ["AZURE_API_KEY"] = ""
os.environ["AZURE_API_BASE"] = ""
os.environ["AZURE_API_VERSION"] = ""


def test_completion_azure_model():
    try:
        print("testing azure custom pricing")
        # azure call
        response = completion(
          model = "azure/<your_deployment_name>", 
          messages = [{ "content": "Hello, how are you?","role": "user"}],
          input_cost_per_token=0.005,
          output_cost_per_token=1,
        )
        # Add any assertions here to check the response
        print(response)
        cost = completion_cost(completion_response=response)
        print(cost)
    except Exception as e:
        raise Exception(f"Error occurred: {e}")

test_completion_azure_model()
```
